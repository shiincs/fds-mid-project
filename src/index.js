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
  registerForm: document.querySelector('#register-form').content,
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
const cartBtnEl = document.querySelector('.cart-btn')
const historyBtnEl = document.querySelector('.history-btn')
// 페이지 그리는 함수 작성 순서
// 1. 템플릿 복사
// 2. 요소 선택
// 3. 필요한 데이터 불러오기
// 4. 내용 채우기
// 5. 이벤트 리스너 등록하기
// 6. 템플릿을 문서에 삽입

function drawBgContainer() {
  // 1. 템플릿 복사
  const frag = document.importNode(templates.bgContainer, true)
  // 2. 요소 선택
  const bgImgEl = frag.querySelector('.bg-img')
  const loginButtonEl = frag.querySelector('.login')
  const registerButtonEl = frag.querySelector('.register')
  // 3. 필요한 데이터 불러오기
  // 4. 내용 채우기
  loginButtonEl.textContent = '로그인'
  registerButtonEl.textContent = '회원가입'
  // 5. 이벤트 리스너 등록하기
  bgImgEl.addEventListener('click', e => {
    drawProdList()
  })
  loginButtonEl.addEventListener('click', e => {
    e.preventDefault()
    drawLoginForm()
  })
  registerButtonEl.addEventListener('click', e => {
    e.preventDefault()
    drawRegisterForm()
  })
  // 6. 템플릿을 문서에 삽입
  headerEl.textContent = ''
  headerEl.appendChild(frag)
}

function drawBgContainerAuthorized() {
  // 1. 템플릿 복사
  const frag = document.importNode(templates.bgContainerAuthorized, true)
  // 2. 요소 선택
  const bgImgEl = frag.querySelector('.bg-img')
  const logoutButtonEl = frag.querySelector('.logout')
  // 3. 필요한 데이터 불러오기
  // 4. 내용 채우기
  // 5. 이벤트 리스너 등록하기
  bgImgEl.addEventListener('click', e => {
    drawProdList()
  })
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

function drawCategoryContainer() {
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
      document.body.classList.add('loading')
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
  const registerBtnEl = frag.querySelector('.register-button')
  const pageMoveBtnEl = document.querySelector('.page-move-btn')
  // 3. 필요한 데이터 불러오기
  // 4. 내용 채우기
  // 5. 이벤트 리스너 등록하기
  // 회원가입 버튼 클릭했을 때
  registerBtnEl.addEventListener('click', e => {
    e.preventDefault()
    drawRegisterForm()
  })
  // 로그인하기 버튼 클릭했을 때
  loginFormEl.addEventListener('submit', async e => {
    e.preventDefault()
    document.body.classList.add('loading')
    const username = e.target.elements.username.value
    const password = e.target.elements.password.value

    const res = await api.post('/users/login', {
      username,
      password
    })
    localStorage.setItem('token', res.data.token)

    rootEl.textContent = ''
    drawBgContainerAuthorized()
    drawProdList()
    document.querySelector('.page-move-btn').classList.remove('hidden')
    document.body.classList.remove('loading')
  })
  // 페이지 이동 버튼 영역에 hidden 클래스 추가(감추기)
  pageMoveBtnEl.classList.add('hidden')
  // 6. 템플릿을 문서에 삽입
  rootEl.textContent = ''
  rootEl.appendChild(frag)
}

async function drawRegisterForm() {
  // 1. 템플릿 복사
  const frag = document.importNode(templates.registerForm, true)
  // 2. 요소 선택
  const registerFormEl = frag.querySelector('.register-form')
  const usernameEl = frag.querySelector('.username')
  const pwConfirmEl = registerFormEl.querySelector('.pw-confirm')
  const pageMoveBtnEl = document.querySelector('.page-move-btn')
  // 3. 필요한 데이터 불러오기
  // username validation을 위해 users 데이터를 불러온다.
  const {data: userList} = await api.get('/users')
  // 4. 내용 채우기
  // 5. 이벤트 리스너 등록하기
  usernameEl.addEventListener('blur', e => {
    userList.forEach(userItem => {
      if(userItem.username === e.target.value) {
        e.target.value = ''
        alert('이미 존재하는 이름입니다.')
      }
    })
  })
  pwConfirmEl.addEventListener('blur', e => {
    const password = registerFormEl.elements.password.value
    const passwordConfirm = e.target.value
    if(password !== passwordConfirm) {
      e.target.value = ''
      alert('비밀번호를 다시 입력해주세요.')
    }
  })
  registerFormEl.addEventListener('submit', async e => {
    e.preventDefault()
    document.body.classList.add('loading')
    const username = e.target.elements.username.value
    const password = e.target.elements.password.value

    const res = await api.post('/users/register', {
      username,
      password
    })
    localStorage.setItem('token', res.data.token)
    alert('회원가입이 완료되었습니다.')
    // login test
    rootEl.textContent = ''
    drawBgContainerAuthorized()
    drawProdList()
    document.body.classList.remove('loading')
  })
  // 페이지 이동 버튼 영역에 hidden 클래스 추가(감추기)
  pageMoveBtnEl.classList.add('hidden')
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
  document.body.classList.add('loading')
  const {data: prodList} = await api.get('/products', {
    params
  })

  // 4. 내용 채우기
  for(const prodItem of prodList) {
    // 1. 템플릿 복사
    const frag = document.importNode(templates.prodItem, true)
    // 2. 요소 선택
    const prodImgEl = frag.querySelector('.prod-img')
    const prodItemEl = frag.querySelector('.prod-item')
    const prodItemTitleEl = frag.querySelector('.prod-item-title')
    const prodItemPriceEl = frag.querySelector('.prod-item-price')
    // 3. 필요한 데이터 불러오기
    // 4. 내용 채우기
    prodImgEl.src = prodItem.mainImgUrl
    prodItemTitleEl.textContent = prodItem.title
    prodItemPriceEl.textContent = (prodItem.price).toLocaleString() + '원'
    // 5. 이벤트 리스너 등록하기
    prodItemEl.addEventListener('click', e => {
      document.body.classList.add('loading')
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
  document.body.classList.remove('loading')
}

async function drawProdDetail(prodId) {
  // 1. 템플릿 복사
  const frag = document.importNode(templates.prodDetail, true)
  // 2. 요소 선택
  const buyFormEl = frag.querySelector('.prod-buy-form')
  // 3. 필요한 데이터 불러오기
  document.body.classList.add('loading')
  const {data: prodDetail} = await api.get(`/products?id=${prodId}&_embed=options`)
  document.body.classList.remove('loading')
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

    // 장바구니 추가 버튼 눌렀을 때 이벤트 발생
    bucketButtonEl.addEventListener('click', async e => {
      e.preventDefault()
      document.body.classList.add('loading')
      if(!localStorage.getItem('token')) {
        confirm('로그인 후 사용할 수 있는 기능입니다. \n로그인 하시겠습니까?') && drawLoginForm()
      } else {
        if(!buyFormEl.elements.option.value) {
          buyFormEl.reportValidity()
          return
        }
        const {data: cartItem} = await api.get('/cartItems', {
          params: {
            ordered: false
          }
        })
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
      }
    })
  }
  // 5. 이벤트 리스너 등록하기
  // 6. 템플릿을 문서에 삽입
  rootEl.textContent = ''
  rootEl.appendChild(frag)
  document.body.classList.remove('loading')
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

  // 총 상품금액 계산용 변수 선언 및 초기화
  let totalPrice = 0

  // 4. 내용 채우기
  cartItems.forEach((cartItem, index, array) => {
    const frag = document.importNode(templates.bucketItem, true)

    const bucketImgEl = frag.querySelector('.bucket-img')
    const bucketTitleEl = frag.querySelector('.bucket-title')
    const bucketOptionEl = frag.querySelector('.bucket-option')
    const bucketPriceEl = frag.querySelector('.bucket-price')
    const bucketPriceSumEl = frag.querySelector('.bucket-price-sum')
    const bucketQuantityEl = frag.querySelector('.select-bucket-quantity')
    const minusQuanEl = frag.querySelector('.minus')
    const plusQuanEl = frag.querySelector('.plus')
    const deleteCellEl = frag.querySelector('.delete-cell')
    const product = prodList.find(prodItem => prodItem.id === cartItem.option.productId)

    bucketImgEl.src = product.mainImgUrl
    bucketTitleEl.textContent = product.title
    bucketOptionEl.textContent = cartItem.option.title
    bucketQuantityEl.value = cartItem.quantity
    bucketPriceEl.textContent = product.price.toLocaleString() + '원'
    bucketPriceSumEl.textContent = (cartItem.quantity * product.price).toLocaleString() + '원'
    totalPrice += (cartItem.quantity * product.price)
    // totalPrice += (bucketQuantityEl.value * product.price)


    // 5. 이벤트 리스너 등록하기
    // 변화하는 수량을 저장하기 위한 flag 변수 및 초기화
    let flag = cartItem.quantity;
    bucketQuantityEl.addEventListener('change', async e => {
      e.preventDefault()
      if(parseInt(bucketQuantityEl.value) >= 1) {
        if(parseInt(bucketQuantityEl.value) !== flag) {
          flag = flag
        } else {
          flag = bucketQuantityEl.value
        }
        totalPrice -= (flag * product.price)
        bucketQuantityEl.value = parseInt(bucketQuantityEl.value)
        const res = await api.patch(`/cartItems/${cartItem.id}`, {
          quantity: parseInt(bucketQuantityEl.value)
        })
        bucketPriceSumEl.textContent = (product.price * bucketQuantityEl.value).toLocaleString() + '원'
        flag = parseInt(bucketQuantityEl.value)
        totalPrice += (product.price * flag)
        totalPriceEl.textContent = totalPrice.toLocaleString() + '원'
      } else {
        alert('1보다 작은 수량을 입력할 수 없습니다.')
      }
    })
    minusQuanEl.addEventListener('click', async e => {
      e.preventDefault()
      if(parseInt(bucketQuantityEl.value) > 1) {
        bucketQuantityEl.value = parseInt(bucketQuantityEl.value) - 1
        const res = await api.patch(`/cartItems/${cartItem.id}`, {
          quantity: parseInt(bucketQuantityEl.value)
        })
        console.log(res)
        bucketPriceSumEl.textContent = (product.price * bucketQuantityEl.value).toLocaleString() + '원'
        totalPrice -= product.price
        totalPriceEl.textContent = totalPrice.toLocaleString() + '원'
      } else {
        alert('1보다 작은 수량을 입력할 수 없습니다.')
      }
    })
    plusQuanEl.addEventListener('click', async e => {
      e.preventDefault()
      bucketQuantityEl.value = parseInt(bucketQuantityEl.value) + 1
      const res = await api.patch(`/cartItems/${cartItem.id}`, {
        quantity: parseInt(bucketQuantityEl.value)
      })
      console.log(res)
      bucketPriceSumEl.textContent = (product.price * bucketQuantityEl.value).toLocaleString() + '원'
      totalPrice += product.price
      totalPriceEl.textContent = totalPrice.toLocaleString() + '원'
    })
    deleteCellEl.addEventListener('click', async e => {
      if(confirm('정말 삭제하시겠습니까?')) {
        const res = await api.delete(`/cartItems/${cartItem.id}`)
        drawBucketList()
      }
    })

    // 6. 템플릿을 문서에 채우기
    bucketListEl.appendChild(frag)
  })
  // 최종 결제금액 채우기
  totalPriceEl.textContent = totalPrice.toLocaleString() + '원'

  // 5. 이벤트 리스너 등록하기
  // 장바구니에서 주문 버튼 클릭 하면
  orderButtonEl.addEventListener('click', async e => {
    document.body.classList.add('loading')
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
    drawOrderList()
  })



  // 6. 템플릿을 문서에 삽입
  rootEl.textContent = ''
  rootEl.appendChild(frag)
  document.body.classList.remove('loading')
}

async function drawOrderList() {
  // 1. 템플릿 복사
  const frag = document.importNode(templates.orderList, true)
  // 2. 요소 선택
  const orderListEl = frag.querySelector('.order-list')
  // 3. 필요한 데이터 불러오기
  // cartItems와 연결된 orders에 get 요청을 보내서 orders 데이터를 받아온다.
  const {data: cartItems} = await api.get('/cartItems', {
    params: {
      ordered: true,
      _expand: 'order',
      _sort: 'orderId',
      _order: 'desc'
    }
  })
  console.log(cartItems)

  const params = new URLSearchParams()
  cartItems.forEach(cartItem => params.append('id', cartItem.optionId))
  params.append('_expand', 'product')

  const { data: optionList } = await api.get('/options', {
    params
  })
  console.log(optionList)

  // unixTime인 orderTime을 orderDate로 바꿔준다.
  function convertOrderDate(orderTime) {
    const unixTime = new Date(orderTime)
    let months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    let year = unixTime.getFullYear()
    let month = (months[unixTime.getMonth()].toString().length === 1)? ('0' + months[unixTime.getMonth()]) : months[unixTime.getMonth()]
    let date = (unixTime.getDate().toString().length === 1)? ('0' + unixTime.getDate()) : unixTime.getDate()
    console.log(year, month, date)
    const orderDate = `${year}-${month}-${date}`
    return orderDate
  }
  // orderTime 형식을 바꿔준다.
  function convertOrderTime(orderTime) {
    const unixTime = new Date(orderTime)
    let hour = (unixTime.getHours().toString().length === 1)? ('0' + unixTime.getHours()) : unixTime.getHours()
    let min = (unixTime.getMinutes().toString().length === 1)? ('0' + unixTime.getMinutes()) : unixTime.getMinutes()
    let sec = (unixTime.getSeconds().toString().length === 1)? ('0' + unixTime.getSeconds()) : unixTime.getSeconds()

    orderTime = `${hour}:${min}:${sec}`
    return orderTime
  }

  // 4. 내용 채우기
  for(const cartItem of cartItems) {
    // 1. 템플릿 복사
    const frag = document.importNode(templates.orderItem, true)
    // 2. 요소 선택
    const orderDateEl = frag.querySelector('.order-date')
    const orderTimeEl = frag.querySelector('.order-time')
    const orderImgEl = frag.querySelector('.order-img')
    const orderTitleEl = frag.querySelector('.order-title')
    const orderOptionEl = frag.querySelector('.order-option')
    const orderQuantityEl = frag.querySelector('.order-quantity')
    const orderPriceSumEl = frag.querySelector('.order-price-sum')
    // 3. 필요한 데이터 불러오기
    // 4. 내용 채우기
    const option = optionList.find(item => item.id === cartItem.optionId)
    console.log(option)

    orderDateEl.textContent = convertOrderDate(cartItem.order.orderTime)
    orderTimeEl.textContent = convertOrderTime(cartItem.order.orderTime)
    orderImgEl.src = option.product.mainImgUrl
    orderOptionEl.textContent = option.title
    orderTitleEl.textContent = option.product.title
    orderQuantityEl.textContent = cartItem.quantity
    orderPriceSumEl.textContent = (option.product.price * cartItem.quantity).toLocaleString() + '원'

    // 5. 이벤트 리스너 등록하기
    // 6.템플릿을 문서에 삽입
    orderListEl.appendChild(frag)
  }

  // 5. 이벤트 리스너 등록하기
  // 6. 템플릿을 문서에 삽입
  rootEl.textContent = ''
  rootEl.appendChild(frag)
  document.body.classList.remove('loading')
}

// 페이지 이동 버튼 이벤트 리스너
cartBtnEl.addEventListener('click', e => {
  e.preventDefault()
  localStorage.getItem('token')? drawBucketList() : confirm('로그인 후 사용할 수 있는 기능입니다. \n로그인 하시겠습니까?') && drawLoginForm()
})
historyBtnEl.addEventListener('click', e => {
  e.preventDefault()
  localStorage.getItem('token')? drawOrderList() : confirm('로그인 후 사용할 수 있는 기능입니다. \n로그인 하시겠습니까?') && drawLoginForm()
})


// 로그인 확인을 위한 토큰 변수 선언 및 초기화
const token = localStorage.getItem('token')
if(token) {
  drawBgContainerAuthorized()
  drawProdList()
} else {
  drawBgContainer()
  drawProdList()
}
