// 初始化
function init(){
  getProductList();
  getCartList();
}
init();

// 一、商品列表

// 取得商品列表
const productList = document.querySelector(".productWrap");
let productData = [];
function getProductList(){
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/products
  `)
  .then(function(response){
      productData = response.data.products;
      renderProductList()
      
  })
}

//(重構) 商品資訊組合：統一組字串
function combineProductInfo(item){
  return `
  <li class="productCard">
      <h4 class="productType">新品</h4>
      <img src="${item.images}" alt="">
      <a href="#" class="addCardBtn" data-id="${item.id}" data-title="${item.title}">加入購物車</a>
      <h3>${item.title}</h3>
      <del class="originPrice">NT$${toThousands(item.origin_price)}</del>
      <p class="nowPrice">NT$${toThousands(item.price)}</p>
  </li>`
}

// 渲染商品列表
function renderProductList(){
  let str = "";
      productData.forEach(function(item){
          str+=combineProductInfo(item);
      })
      productList.innerHTML = str;
}

// 商品列表選單切換事件
const productSelect = document.querySelector(".productSelect");
productSelect.addEventListener("change", function(e){
  const category = e.target.value;
  if(category=="全部"){
      renderProductList();
      return;
  }
  let str = "";
  productData.forEach(function(item){
      if(item.category == category){
          str+=str+=combineProductInfo(item);
      }
  })
  productList.innerHTML = str;
})

// 二、購物車

// 取得購物車資料
const cartList = document.querySelector(".shoppingCart-tableList");
const finalTotal = document.querySelector(".finalTotal");
let cartData = [];
function getCartList(){
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts
  `)
  .then(function(response){
      cartData = response.data.carts;
      getCartList();
      let str = "";
      cartData.forEach(function(item){
          str+=
              `<tr>
                  <td>
                      <div class="cardItem-title">
                          <img src="${item.product.images}" alt="">
                          <p>${item.product.title}</p>
                      </div>
                  </td>
                  <td>NT$${toThousands(item.product.origin_price)}</td>
                  <td>${item.quantity}</td>
                  <td>NT$${toThousands(item.product.price)}</td>
                  <td class="discardBtn">
                      <a href="#" class="material-icons" data-id="${item.id}" data-title="${item.product.title}">
                          clear
                      </a>
                  </td>
              </tr>`
      })
      // 取得購物車資料
      cartList.innerHTML = str;
      //取得總金額
      finalTotal.textContent = toThousands(response.data.finalTotal);
  })
}

// 加入購物車事件
  // 監聽對象是商品列表 productList ，再用 if 去確保點擊到按鈕 addCardBtn 才會觸發事件
  // 因為 querySelector 只能綁單一 class；querySelectorAll 需要每顆按鈕個別綁定，資料越多越難管理，也會拖慢效能
  // 監聽最好都寫在外層，用最外層去綁監聽，再去選擇內部的觸發點最保險
productList.addEventListener("click", function(e){
  // 取消默認的行為(錨點點擊後會至頂)
  e.preventDefault(); 
  
  // 確保點擊按鈕才會觸發
  let addCardBtn = e.target.getAttribute("class");
      if(addCardBtn!== "addCardBtn") {
      return;  // 點到按鈕以外的區塊沒有反應
  }
  
  // 新增一筆 data-id 到 商品資訊組合 的按鈕<a>標籤上，並賦予 item 的 id，用 id 來回傳商品的加入購物車事件
  // 如果加入購物車事件被觸發，productId即為商品資訊上的 data-id
  let productId = e.target.getAttribute("data-id");
  let productTitle = e.target.getAttribute("data-title"); // 額外：在 alert 帶入商品名稱
  
  
  // 用 forEach 跑一次購物車資料，判斷購物車內是否已經有相同品項，如果有 item.quantity +1
  let productNum = 1;
  cartData.forEach(function(item){
      if(item.product.id === productId){
          productNum = item.quantity + 1;
          
      }
  })
  
  // 把新增的購物車資料 post 回資料庫
  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts`, {
      "data": {
        "productId": productId,
        "quantity": productNum,
      }
    }).then(function(response){
      
      alert(`${productTitle} 已加入購物車`);
      getCartList();
    })
})

// 購物車取消事件
// 監聽購物車清單
cartList.addEventListener("click", function(e){
  // 取消默認的行為(錨點點擊後會至頂)
  e.preventDefault();
  // 用 data-id 取得觸發事件的商品 Id
  const cartId = e.target.getAttribute("data-id");
  

  // 只有按鈕能夠回傳 cartId，限定點擊按鈕，其他區域無效
  if(cartId==null){
      return;
  }
  
  let productTitle = e.target.getAttribute("data-title"); // 額外：在 alert 帶入商品名稱
  // 連接資料庫
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts/${cartId}`)
  .then(function(response){
      alert(`已刪除 ${productTitle}`);
      getCartList(); // 重新渲染，整理目前資料
  })
})

// 刪除整個購物車事件
//監聽全部刪除按鈕
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click", function(e){
  e.preventDefault();
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts`)
  .then(function(response){
      alert(`已全部刪除`);
      getCartList(); // 重新渲染，整理目前資料
  })
  .catch(function(response){
      alert(`購物車沒有東西`);
  })
})

// 送出訂單事件
const orderInfoBtn =  document.querySelector(".orderInfo-btn");
orderInfoBtn.addEventListener("click", function(e){
  e.preventDefault();
  const customerName = document.querySelector("#customerName").value;
  const customerPhone = document.querySelector("#customerPhone").value;
  const customerEmail = document.querySelector("#customerEmail").value;
  const customerAddress = document.querySelector("#customerAddress").value;
  const tradeWay = document.querySelector("#tradeWay").value;
  if(cartData.length==0){
      alert("購物車是空的");
      return;
  }else if(customerName =="" ||customerPhone =="" ||customerEmail =="" ||customerAddress =="" ||tradeWay ==""){
      alert("資料不可以留空");
      return;
  }

  // post 傳回訂單資料
  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/orders`,{
      "data": {
        "user": {
          "name": customerName,
          "tel": customerPhone,
          "email": customerEmail,
          "address": customerAddress,
          "payment": tradeWay,
        }
      }
    }).then(function(response){
      alert("已送出訂單");
      // 表單回復預設值
      document.querySelector("#customerName").value="";
      document.querySelector("#customerPhone").value="";
      document.querySelector("#customerEmail").value="";
      document.querySelector("#customerAddress").value="";
      document.querySelector("#tradeWay").value="ATM";
      console.log(customerAddress)
      getCartList();
    })
})

// 千分位工具
function toThousands(x){
  let parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}