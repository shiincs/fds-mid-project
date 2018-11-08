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
  prodDetail: document.querySelector('#prod-detail').content,
  bucketList: document.querySelector('#bucket-list').content,
  bucketItem: document.querySelector('#bucket-item').content,
  orderList: document.querySelector('#order-list').content,
  orderItem: document.querySelector('#order-item').content
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
    const selectOptionEl = buyFormEl.querySelector('.select-option')
    const prodQuanEl = frag.querySelector('.select-quantity')
    const totalPriceEl = frag.querySelector('.total-price')
    const minusQuanEl = frag.querySelector('.minus')
    const plusQuanEl = frag.querySelector('.plus')
    const bucketButtonEl = frag.querySelector('.bucket-btn')
    const buyButtonEl = frag.querySelector('.buy-btn')

    frag.querySelectorAll('.option').forEach((optionEl, index) => {
      optionEl.textContent = itemDetail.options[index].title
      optionEl.value = itemDetail.options[index].id
    })
    detailImgEl.src = itemDetail.mainImgUrl
    detailDescriptionEl.src = itemDetail.detailImgUrls[0]
    detailTitleEl.value = itemDetail.title
    detailPriceEl.value = itemDetail.price.toLocaleString() + '원'
    totalPriceEl.textContent = (itemDetail.price * prodQuanEl.value).toLocaleString() + '원'

    prodQuanEl.addEventListener('change', e => {
      e.preventDefault()
      if(parseInt(prodQuanEl.value) > 1) {
        prodQuanEl.value = parseInt(prodQuanEl.value)
        totalPriceEl.textContent = (itemDetail.price * prodQuanEl.value).toLocaleString() + '원'
      } else {
        alert('1보다 작은 수량을 입력할 수 없습니다.')
      }
    })
    minusQuanEl.addEventListener('click', e => {
      e.preventDefault()
      if(parseInt(prodQuanEl.value) > 1) {
        prodQuanEl.value = parseInt(prodQuanEl.value) - 1
        totalPriceEl.textContent = (itemDetail.price * prodQuanEl.value).toLocaleString() + '원'
      } else {
        alert('1보다 작은 수량을 입력할 수 없습니다.')
      }
    })
    plusQuanEl.addEventListener('click', e => {
      e.preventDefault()
      prodQuanEl.value = parseInt(prodQuanEl.value) + 1
      totalPriceEl.textContent = (itemDetail.price * prodQuanEl.value).toLocaleString() + '원'
    })

    bucketButtonEl.addEventListener('click', async e => {
      e.preventDefault()
      const {data: cartItem} = await api.get('/cartItems')
      if(cartItem.length !== 0) {
        for(let i=0; i < cartItem.length; i++) {
          if(cartItem[i].optionId === parseInt(selectOptionEl.value)) {
            if(confirm('선택하신 상품은 이미 장바구니에 있습니다. 장바구니로 이동하시겠습니까?')) {
              drawBucketList()
            } else {
              break
            }
          } else {
            const res = await api.post('/cartItems', {
              optionId: parseInt(selectOptionEl.value),
              quantity: parseInt(prodQuanEl.value),
              ordered: false
            })
            drawBucketList()
          }
          break
        }
      } else {
        const res = await api.post('/cartItems', {
          optionId: parseInt(selectOptionEl.value),
          quantity: parseInt(prodQuanEl.value),
          ordered: false
        })
        drawBucketList()
      }

    })
  }
  // 5. 이벤트 리스너 등록하기

  // 6. 템플릿을 문서에 삽입
  rootEl.textContent = ''
  rootEl.appendChild(frag)
}

async function drawBucketList() {
  // 1. 템플릿 복사
  const frag = document.importNode(templates.bucketList, true)
  // 2. 요소 선택
  const bucketListEl = frag.querySelector('.bucket-list')
  const totalPriceEl = frag.querySelector('.total-price')
  const orderButtonEl = frag.querySelector('.all-buy-btn')
  // 3. 필요한 데이터 불러오기
  const {data: cartItems} = await api.get('/cartItems', {
    params: {
      ordered: false,
      _expand: 'option'
    }
  })

  const params = new URLSearchParams()
  cartItems.forEach(item => {
    params.append('id', item.option.productId)
  })
  const {data: prodList} = await api.get('/products?_embed=options', {
    params
  })

  // 총 상품금액 계산용
  let totalPrice = 0

  // 4. 내용 채우기
  cartItems.forEach((cartItem, index, array) => {
    const frag = document.importNode(templates.bucketItem, true)

    const bucketImgEl = frag.querySelector('.bucket-img')
    const bucketTitleEl = frag.querySelector('.bucket-title')
    const bucketOptionEl = frag.querySelector('.bucket-option')
    const bucketPriceEl = frag.querySelector('.bucket-price')
    const bucketPriceSumEl = frag.querySelector('.bucket-price-sum')
    const bucketQuantityEl = frag.querySelector('.bucket-quantity')
    const deleteCellEl = frag.querySelector('.delete-cell')

    const product = prodList.find(prodItem => prodItem.id === cartItem.option.productId)

    bucketImgEl.src = product.mainImgUrl
    bucketTitleEl.textContent = product.title
    bucketOptionEl.textContent = cartItem.option.title
    bucketQuantityEl.textContent = cartItem.quantity
    bucketPriceEl.textContent = product.price.toLocaleString() + '원'
    bucketPriceSumEl.textContent = (cartItem.quantity * product.price).toLocaleString() + '원'
    totalPrice += (cartItem.quantity * product.price)

    deleteCellEl.addEventListener('click', async e => {
      if(confirm('정말 삭제하시겠습니까?')) {
        const res = await api.delete(`/cartItems/${cartItem.id}`)
        drawBucketList()
      }
    })
    bucketListEl.appendChild(frag)
  })
  // 최종 결제금액 채우기
  totalPriceEl.textContent = totalPrice.toLocaleString() + '원'

  // 5. 이벤트 리스너 등록하기
  // 장바구니에서 주문 버튼 클릭 하면
  orderButtonEl.addEventListener('click', async e => {
    // '주문' 객체를 먼저 만들고 나서
    const {data: {id: orderId}} = await api.post('/orders', {
      orderTime: Date.now() // 현재 시각을 나타내는 정수
    })

    // parameter 저장을 위해 URLSearchParams를 만든다.
    const params = new URLSearchParams();
    // 위에서 장바구니에 get 요청을 보내 받아온 장바구니의 각 항목의 id를 params에 저장해준다.
    cartItems.forEach(cartItem => params.append('id', cartItem.id))

    // 장바구니의 주문되지 않은 모든 항목의 id를 파라미터로 장바구니에 get 요청을 보내서 장바구니 데이터를 받아온다.
    const {data: cartOrderItem} = await api.get('/cartItems', {
      params
    })

    // 위에서 만든 주문 객체의 id를 장바구니 항목의 orderId에 넣어서 orders와 cartItems를 연결시키고,
    //  ordered 값을 true로 바꾼다.
    for(const orderItem of cartOrderItem) {
      await api.patch(`/cartItems/${orderItem.id}`, {
        ordered: true,
        orderId
      })
    }
    // orderId를 인자로 넣어서 주문내역을 그리는 함수를 실행한다.
    drawOrderList(orderId)
  })

  // 6. 템플릿을 문서에 삽입
  rootEl.textContent = ''
  rootEl.appendChild(frag)
}

async function drawOrderList(orderId) {
  // 1. 템플릿 복사
  const frag = document.importNode(templates.orderList, true)
  // 2. 요소 선택
  const orderListEl = frag.querySelector('.order-list')
  // 3. 필요한 데이터 불러오기
  // cartItems와 연결된 orders에 get 요청을 보내서 orders 데이터를 받아온다.
  const {data: {cartItems, orderTime}} = await api.get(`/orders/${orderId}`, {
    params: {
      _embed: 'cartItems'
    }
  })

  console.log(cartItems)
  console.log(orderTime)

  const params = new URLSearchParams()
  cartItems.forEach(cartItem => params.append('id', cartItem.optionId))
  params.append('_expand', 'product')

  const { data: optionList } = await api.get('/options', {
    params
  })
  console.log(optionList)

  // 4. 내용 채우기
  for(const cartItem of cartItems) {
    console.log(cartItem)
    // 1. 템플릿 복사
    const frag = document.importNode(templates.orderItem, true)
    // 2. 요소 선택
    const orderDateEl = frag.querySelector('.order-date')
    const orderImgEl = frag.querySelector('.order-img')
    const orderTitleEl = frag.querySelector('.order-title')
    const orderOptionEl = frag.querySelector('.order-option')
    const orderQuantityEl = frag.querySelector('.order-quantity')
    const orderPriceSumEl = frag.querySelector('.order-price-sum')
    // 3. 필요한 데이터 불러오기
    // 4. 내용 채우기
    const option = optionList.find(item => item.id === cartItem.optionId)
    console.log(option)

    orderDateEl.textContent = orderTime
    orderImgEl.src = option.product.mainImgUrl
    orderOptionEl.textContent = option.title
    orderTitleEl.textContent = option.product.title
    orderQuantityEl.textContent = cartItem.quantity
    orderPriceSumEl.textContent = (option.product.price * cartItem.quantity).toLocaleString() + '원'
    // 6.템플릿을 문서에 삽입
    orderListEl.appendChild(frag)
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
