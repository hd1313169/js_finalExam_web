"use strict";

// <!-- 預設 JS，請同學不要修改此處 -->
document.addEventListener('DOMContentLoaded', function () {
  var ele = document.querySelector('.recommendation-wall');
  ele.style.cursor = 'grab';
  var pos = {
    top: 0,
    left: 0,
    x: 0,
    y: 0
  };

  var mouseDownHandler = function mouseDownHandler(e) {
    ele.style.cursor = 'grabbing';
    ele.style.userSelect = 'none';
    pos = {
      left: ele.scrollLeft,
      top: ele.scrollTop,
      // Get the current mouse position
      x: e.clientX,
      y: e.clientY
    };
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  };

  var mouseMoveHandler = function mouseMoveHandler(e) {
    // How far the mouse has been moved
    var dx = e.clientX - pos.x;
    var dy = e.clientY - pos.y; // Scroll the element

    ele.scrollTop = pos.top - dy;
    ele.scrollLeft = pos.left - dx;
  };

  var mouseUpHandler = function mouseUpHandler() {
    ele.style.cursor = 'grab';
    ele.style.removeProperty('user-select');
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
  }; // Attach the handler


  ele.addEventListener('mousedown', mouseDownHandler);
}); // menu 切換

var menuOpenBtn = document.querySelector('.menuToggle');
var linkBtn = document.querySelectorAll('.topBar-menu a');
var menu = document.querySelector('.topBar-menu');
menuOpenBtn.addEventListener('click', menuToggle);
linkBtn.forEach(function (item) {
  item.addEventListener('click', closeMenu);
});

function menuToggle() {
  if (menu.classList.contains('openMenu')) {
    menu.classList.remove('openMenu');
  } else {
    menu.classList.add('openMenu');
  }
}

function closeMenu() {
  menu.classList.remove('openMenu');
} // <!-- 預設 JS，請同學不要修改此處END -->
// <!-- 載入資料庫、金鑰、環境變數 -->


var apiPath = "ryanchiangfinaleaxam";
var token = "Jsbl8ongs9P32p2iKyLykEVQxcG2"; // <!-- 載入資料庫、金鑰、環境變數END -->
// 初始化

function init() {
  getProductList();
  getCartList();
}

init(); // 一、商品列表
// 取得商品列表

var productList = document.querySelector(".productWrap");
var productData = [];

function getProductList() {
  axios.get("https://livejs-api.hexschool.io/api/livejs/v1/customer/".concat(apiPath, "/products\n  ")).then(function (response) {
    productData = response.data.products;
    renderProductList();
  });
} //(重構) 商品資訊組合：統一組字串


function combineProductInfo(item) {
  return "\n  <li class=\"productCard\">\n      <h4 class=\"productType\">\u65B0\u54C1</h4>\n      <img src=\"".concat(item.images, "\" alt=\"\">\n      <a href=\"#\" class=\"addCardBtn\" data-id=\"").concat(item.id, "\" data-title=\"").concat(item.title, "\">\u52A0\u5165\u8CFC\u7269\u8ECA</a>\n      <h3>").concat(item.title, "</h3>\n      <del class=\"originPrice\">NT$").concat(toThousands(item.origin_price), "</del>\n      <p class=\"nowPrice\">NT$").concat(toThousands(item.price), "</p>\n  </li>");
} // 渲染商品列表


function renderProductList() {
  var str = "";
  productData.forEach(function (item) {
    str += combineProductInfo(item);
  });
  productList.innerHTML = str;
} // 商品列表選單切換事件


var productSelect = document.querySelector(".productSelect");
productSelect.addEventListener("change", function (e) {
  var category = e.target.value;

  if (category == "全部") {
    renderProductList();
    return;
  }

  var str = "";
  productData.forEach(function (item) {
    if (item.category == category) {
      str += str += combineProductInfo(item);
    }
  });
  productList.innerHTML = str;
}); // 二、購物車
// 取得購物車資料

var cartList = document.querySelector(".shoppingCart-tableList");
var finalTotal = document.querySelector(".finalTotal");
var cartData = [];

function getCartList() {
  axios.get("https://livejs-api.hexschool.io/api/livejs/v1/customer/".concat(apiPath, "/carts\n  ")).then(function (response) {
    cartData = response.data.carts;
    getCartList();
    var str = "";
    cartData.forEach(function (item) {
      str += "<tr>\n                  <td>\n                      <div class=\"cardItem-title\">\n                          <img src=\"".concat(item.product.images, "\" alt=\"\">\n                          <p>").concat(item.product.title, "</p>\n                      </div>\n                  </td>\n                  <td>NT$").concat(toThousands(item.product.origin_price), "</td>\n                  <td>").concat(item.quantity, "</td>\n                  <td>NT$").concat(toThousands(item.product.price), "</td>\n                  <td class=\"discardBtn\">\n                      <a href=\"#\" class=\"material-icons\" data-id=\"").concat(item.id, "\" data-title=\"").concat(item.product.title, "\">\n                          clear\n                      </a>\n                  </td>\n              </tr>");
    }); // 取得購物車資料

    cartList.innerHTML = str; //取得總金額

    finalTotal.textContent = toThousands(response.data.finalTotal);
  });
} // 加入購物車事件
// 監聽對象是商品列表 productList ，再用 if 去確保點擊到按鈕 addCardBtn 才會觸發事件
// 因為 querySelector 只能綁單一 class；querySelectorAll 需要每顆按鈕個別綁定，資料越多越難管理，也會拖慢效能
// 監聽最好都寫在外層，用最外層去綁監聽，再去選擇內部的觸發點最保險


productList.addEventListener("click", function (e) {
  // 取消默認的行為(錨點點擊後會至頂)
  e.preventDefault(); // 確保點擊按鈕才會觸發

  var addCardBtn = e.target.getAttribute("class");

  if (addCardBtn !== "addCardBtn") {
    return; // 點到按鈕以外的區塊沒有反應
  } // 新增一筆 data-id 到 商品資訊組合 的按鈕<a>標籤上，並賦予 item 的 id，用 id 來回傳商品的加入購物車事件
  // 如果加入購物車事件被觸發，productId即為商品資訊上的 data-id


  var productId = e.target.getAttribute("data-id");
  var productTitle = e.target.getAttribute("data-title"); // 額外：在 alert 帶入商品名稱
  // 用 forEach 跑一次購物車資料，判斷購物車內是否已經有相同品項，如果有 item.quantity +1

  var productNum = 1;
  cartData.forEach(function (item) {
    if (item.product.id === productId) {
      productNum = item.quantity + 1;
    }
  }); // 把新增的購物車資料 post 回資料庫

  axios.post("https://livejs-api.hexschool.io/api/livejs/v1/customer/".concat(apiPath, "/carts"), {
    "data": {
      "productId": productId,
      "quantity": productNum
    }
  }).then(function (response) {
    alert("".concat(productTitle, " \u5DF2\u52A0\u5165\u8CFC\u7269\u8ECA"));
    getCartList();
  });
}); // 購物車取消事件
// 監聽購物車清單

cartList.addEventListener("click", function (e) {
  // 取消默認的行為(錨點點擊後會至頂)
  e.preventDefault(); // 用 data-id 取得觸發事件的商品 Id

  var cartId = e.target.getAttribute("data-id"); // 只有按鈕能夠回傳 cartId，限定點擊按鈕，其他區域無效

  if (cartId == null) {
    return;
  }

  var productTitle = e.target.getAttribute("data-title"); // 額外：在 alert 帶入商品名稱
  // 連接資料庫

  axios["delete"]("https://livejs-api.hexschool.io/api/livejs/v1/customer/".concat(apiPath, "/carts/").concat(cartId)).then(function (response) {
    alert("\u5DF2\u522A\u9664 ".concat(productTitle));
    getCartList(); // 重新渲染，整理目前資料
  });
}); // 刪除整個購物車事件
//監聽全部刪除按鈕

var discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click", function (e) {
  e.preventDefault();
  axios["delete"]("https://livejs-api.hexschool.io/api/livejs/v1/customer/".concat(apiPath, "/carts")).then(function (response) {
    alert("\u5DF2\u5168\u90E8\u522A\u9664");
    getCartList(); // 重新渲染，整理目前資料
  })["catch"](function (response) {
    alert("\u8CFC\u7269\u8ECA\u6C92\u6709\u6771\u897F");
  });
}); // 送出訂單事件

var orderInfoBtn = document.querySelector(".orderInfo-btn");
orderInfoBtn.addEventListener("click", function (e) {
  e.preventDefault();
  var customerName = document.querySelector("#customerName").value;
  var customerPhone = document.querySelector("#customerPhone").value;
  var customerEmail = document.querySelector("#customerEmail").value;
  var customerAddress = document.querySelector("#customerAddress").value;
  var tradeWay = document.querySelector("#tradeWay").value;

  if (cartData.length == 0) {
    alert("購物車是空的");
    return;
  } else if (customerName == "" || customerPhone == "" || customerEmail == "" || customerAddress == "" || tradeWay == "") {
    alert("資料不可以留空");
    return;
  } // post 傳回訂單資料


  axios.post("https://livejs-api.hexschool.io/api/livejs/v1/customer/".concat(apiPath, "/orders"), {
    "data": {
      "user": {
        "name": customerName,
        "tel": customerPhone,
        "email": customerEmail,
        "address": customerAddress,
        "payment": tradeWay
      }
    }
  }).then(function (response) {
    alert("已送出訂單"); // 表單回復預設值

    document.querySelector("#customerName").value = "";
    document.querySelector("#customerPhone").value = "";
    document.querySelector("#customerEmail").value = "";
    document.querySelector("#customerAddress").value = "";
    document.querySelector("#tradeWay").value = "ATM";
    console.log(customerAddress);
    getCartList();
  });
}); // 千分位工具

function toThousands(x) {
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}
//# sourceMappingURL=all.js.map
