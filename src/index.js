import '@babel/polyfill' // 이 라인을 지우지 말아주세요!

import axios from 'axios'

const api = axios.create({
  baseURL: process.env.API_URL
})

api.interceptors.request.use(function (config) {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers['Authorization'] = 'Bearer ' + token
  }
  return config
});

const templates = {
  loginForm: document.querySelector('#login-form').content,
  prodList: document.querySelector('#prod-list').content,
  prodItem: document.querySelector('#prod-item').content,
  bgContainer: document.querySelector('#bg-container').content,
  bgContainerAuthorized: document.querySelector('#bg-container-authorized').content,
  categoryContainer: document.querySelector('#category-container').content,
  prodDetail: document.querySelector('#prod-detail').content
}

const headerEl = document.querySelector('.header')
const rootEl = document.querySelector('.root')

// 페이지 그리는 함수 작성 순서
// 1. 템플릿 복사
// 2. 요소 선택
// 3. 필요한 데이터 불러오기
// 4. 내용 채우기
// 5. 이벤트 리스너 등록하기
// 6. 템플릿을 문서에 삽입

async function drawBgContainer() {
  // 1. 템플릿 복사
  const frag = document.importNode(templates.bgContainer, true)
  // 2. 요소 선택
  const loginButtonEl = frag.querySelector('.login')
  const registerButtonEl = frag.querySelector('.register')
  // 3. 필요한 데이터 불러오기
  // 4. 내용 채우기
  loginButtonEl.textContent = '로그인'
  registerButtonEl.textContent = '회원가입'
  // 5. 이벤트 리스너 등록하기
  loginButtonEl.addEventListener('click', e => {
    e.preventDefault()
    drawLoginForm()
  })
  // 6. 템플릿을 문서에 삽입
  headerEl.textContent = ''
  headerEl.appendChild(frag)
}

async function drawBgContainerAuthorized() {
  // 1. 템플릿 복사
  const frag = document.importNode(templates.bgContainerAuthorized, true)
  // 2. 요소 선택
  const logoutButtonEl = frag.querySelector('.logout')
  // 3. 필요한 데이터 불러오기
  // 4. 내용 채우기
  logoutButtonEl.textContent = '로그아웃'
  // 5. 이벤트 리스너 등록하기
  logoutButtonEl.addEventListener('click', e => {
    e.preventDefault()
    if(confirm('로그아웃 하시렵니까?')) {
      localStorage.removeItem('token')
      drawBgContainer()
      drawProdList()
    }
  })
  // 6. 템플릿을 문서에 삽입
  headerEl.textContent = ''
  headerEl.appendChild(frag)
}

async function drawCategoryContainer() {
  // 1. 템플릿 복사
  const frag = document.importNode(templates.categoryContainer, true)
  // 2. 요소 선택
  const allEl = frag.querySelector('.all')
  const capEl = frag.querySelector('.cap')
  const uniformEl = frag.querySelector('.uniform')
  const markingEl = frag.querySelector('.marking')
  const fashionEl = frag.querySelector('.fashion')
  const cheerEl = frag.querySelector('.cheer')
  const baseballEl = frag.querySelector('.baseball')
  const etcEl = frag.querySelector('.etc')
  const specialEl = frag.querySelector('.special')
  // 3. 필요한 데이터 불러오기
  // 4. 내용 채우기
  // 5. 이벤트 리스너 등록하기
  function categoryEvent(el, category='') {
    el.addEventListener('click', e => {
      drawProdList(category)
    })
  }
  categoryEvent(allEl)
  categoryEvent(capEl, 'cap')
  categoryEvent(uniformEl, 'uniform')
  // 6. 템플릿을 문서에 삽입
  rootEl.appendChild(frag)
}

async function drawLoginForm() {
  // 1. 템플릿 복사
  const frag = document.importNode(templates.loginForm, true)
  // 2. 요소 선택
  const loginFormEl = frag.querySelector('.login-form')
  // 3. 필요한 데이터 불러오기
  // 4. 내용 채우기
  // 5. 이벤트 리스너 등록하기
  loginFormEl.addEventListener('submit', async e => {
    e.preventDefault()
    const username = e.target.elements.username.value
    const password = e.target.elements.password.value
    const res = await api.post('/users/login', {
      username,
      password
    })
    localStorage.setItem('token', res.data.token)
    // login test
    drawBgContainerAuthorized()
    drawProdList()
  })

  // 6. 템플릿을 문서에 삽입
  rootEl.textContent = ''
  rootEl.appendChild(frag)
}

async function drawProdList(category) {
  // 1. 템플릿 복사
  const frag = document.importNode(templates.prodList, true)
  // 2. 요소 선택
  const prodListEl = frag.querySelector('.prod-list')
  // 3. 필요한 데이터 불러오기

  //카테고리를 입력받을 경우 서치파람에 넣어준다.
  const params = new URLSearchParams()
  if(category) {
    params.append('category', category)
  }
  // 파라미터를 이용해 상품 목록을 받아온다.
  const {data: prodList} = await api.get('/products', {
    params
  })

  // 4. 내용 채우기
  for(const prodItem of prodList) {
    // 1. 템플릿 복사
    const frag = document.importNode(templates.prodItem, true)
    // 2. 요소 선택
    const prodImgEl = frag.querySelector('.prod-img')
    const prodItemTitleEl = frag.querySelector('.prod-item-title')
    const prodItemPriceEl = frag.querySelector('.prod-item-price')
    // 3. 필요한 데이터 불러오기
    // 4. 내용 채우기
    // prodImgEl.setAttribute('src', prodItem.mainImgUrl)
    prodImgEl.src = prodItem.mainImgUrl
    prodItemTitleEl.textContent = prodItem.title
    prodItemPriceEl.textContent = prodItem.price
    // 5. 이벤트 리스너 등록하기
    prodImgEl.addEventListener('click', async e => {
      e.preventDefault()
      drawProdDetail(prodItem.id)
    })
    prodItemTitleEl.addEventListener('click', async e => {
      e.preventDefault()
      drawProdDetail(prodItem.id)
    })
    prodItemPriceEl.addEventListener('click', async e => {
      e.preventDefault()
      drawProdDetail(prodItem.id)
    })
    // 6. 템플릿을 문서에 삽입
    prodListEl.appendChild(frag)
  }
  // 5. 이벤트 리스너 등록하기
  // 6. 템플릿을 문서에 삽입
  rootEl.textContent = ''
  drawCategoryContainer()
  rootEl.appendChild(frag)
}

async function drawProdDetail(prodId) {
  // 1. 템플릿 복사
  const frag = document.importNode(templates.prodDetail, true)
  // 2. 요소 선택
  const buyFormEl = frag.querySelector('.prod-buy-form')
  // 3. 필요한 데이터 불러오기
  const {data: prodDetail} = await api.get(`/products?id=${prodId}&_embed=options`)
  // 4. 내용 채우기
  for(const itemDetail of prodDetail) {
    const detailImgEl = frag.querySelector('.prod-detail-img')
    const detailDescriptionEl = frag.querySelector('.prod-detail-description-img')
    const detailTitleEl = buyFormEl.querySelector('.prod-detail-title')
    const detailPriceEl = buyFormEl.querySelector('.prod-detail-price')
    const prodQuanEl = frag.querySelector('.select-quantity')
    const totalPriceEl = frag.querySelector('.total-price')
    const minusQuanEl = frag.querySelector('.minus')
    const plusQuanEl = frag.querySelector('.plus')

    frag.querySelectorAll('.option').forEach((optionEl, index) => {
      optionEl.textContent = itemDetail.options[index].title
      optionEl.value = itemDetail.options[index].title
    })
    detailImgEl.src = itemDetail.mainImgUrl
    detailDescriptionEl.src = itemDetail.detailImgUrls[0]
    detailTitleEl.value = itemDetail.title
    detailPriceEl.value = itemDetail.price + '원'
    totalPriceEl.textContent = (itemDetail.price * prodQuanEl.value) + '원'

    minusQuanEl.addEventListener('click', e=> {
      e.preventDefault()
      if(parseInt(prodQuanEl.value) > 1) {
        prodQuanEl.value = parseInt(prodQuanEl.value) - 1
        totalPriceEl.textContent = itemDetail.price * parseInt(prodQuanEl.value)
      } else {
        alert('1보다 작은 수량을 입력할 수 없습니다.')
      }
    })
    plusQuanEl.addEventListener('click', e => {
      e.preventDefault()
      prodQuanEl.value = parseInt(prodQuanEl.value) + 1
      totalPriceEl.textContent = itemDetail.price * parseInt(prodQuanEl.value)
    })
  }
  // 5. 이벤트 리스너 등록하기

  // 6. 템플릿을 문서에 삽입
  rootEl.textContent = ''
  rootEl.appendChild(frag)
}
const token = localStorage.getItem('token')
if(token) {
  drawBgContainerAuthorized()
  drawProdList()
} else {
  drawBgContainer()
  drawProdList()
}
// drawProdList()
