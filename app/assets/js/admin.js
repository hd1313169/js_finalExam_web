let orderData = []; // 用來儲存需要用到的資料
const orderList = document.querySelector(".orderList"); //選取表單內容

// 初始化
function init(){
    getOrderList();
}
init();

// 圓餅圖
function renderC3(){
    let obj = {};
    // LV1
    orderData.forEach(function(item){
        let productItem = item.products;
        productItem.forEach(function(productItems){
            if(obj[productItems.title]==undefined){
                obj[productItems.title]=productItems.price*productItems.quantity;
            }else{
                obj[productItems.title]+=productItems.price*productItems.quantity;
            }
        })
    });
    
    // LV2
    // 依營收重新排列品項
    let rank = Object.entries(obj)
    rank.sort(function(a, b){
    return b[1] - a[1];
    })
    
    if(rank.length>3){
        let otherTotal = 0;
        rank.forEach(function(item, index){
            if(index>2){
                otherTotal+=rank[index][1];
            }
        })
        rank.splice(3, rank.length-1);
        rank.push(["其他", otherTotal])
    }
    console.log(rank);
    // 生成 c3 圖表
    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "donut",
            columns: rank,
        },
        color:{
            pattern:["#301E5F","#5434A7", "#9D7FEA", "#DACBFF"]
        }
    });
}

// 取得表單資料
function getOrderList(){
    // 接使用者 API 路徑及金鑰
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${apiPath}/orders`, 
        {headers:{"authorization": token}
    })
    .then (function(response){
        orderData = response.data.orders;
        // 訂單管理
        let str = "";
        orderData.forEach(function(item){

            // 訂單品項處理
            let productStr = "";
            let productItem = item.products;
            productItem.forEach(function(productItems){
                productStr+=`<p>${productItems.title} *${productItems.quantity}</p>`
            })

            // 時間狀態處理
            const timeStamp = new Date(item.createdAt*1000); // new Date 語法只支援 13碼，要把時間戳從 10 碼轉成 13 碼>>直接 *1000
            let createdTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth()+1}/${timeStamp.getDate()}`;

            // 訂單狀態處理
            let orderStatus = "";
            if(item.paid==true){
                orderStatus="已處理";
            }else if(item.paid==false){
                orderStatus="未處理";
            }else{
                orderStatus="狀態錯誤";
            }
            // 訂單資訊組合
            str+=
                `<tr>
                    <td>${item.id}</td>
                    <td>
                        <p>${item.user.name}</p>
                        <p>${item.user.tel}</p>
                    </td>
                    <td>${item.user.address}</td>
                    <td>${item.user.email}</td>
                    <td>
                        <p>${productStr}</p>
                    </td>
                    <td>${createdTime}</td>
                    <td>
                        <a href="#" class="orderStatus" data-status="${item.paid}" data-id="${item.id}">${orderStatus}</a>
                    </td>
                    <td>
                        <input type="button" class="delSingleOrder-Btn orderDelete" value="刪除" data-id="${item.id}">
                    </td>
                </tr>`
        })
        orderList.innerHTML = str;
        renderC3();
    })
}

// 監聽表單 tbody 中的按鈕事件：1.訂單狀態 2.刪除
orderList.addEventListener("click", function(e){
    e.preventDefault(); //防跳轉至頂

    // 設定觸發條件：以按鈕的 class 判斷點到哪個按鈕
    const targetBtn = e.target.getAttribute("class");
    // 設定資料庫要回傳的資料條件
    const itemId = e.target.getAttribute("data-id")
    const itemStatus = e.target.getAttribute("data-status");
    
    // 1. 點到訂單狀態按鈕：觸發修改訂單狀態
    if(targetBtn=="orderStatus"){
        changeOrderStatus(itemStatus, itemId);
    }
    // 2. 點到刪除按鈕：觸發刪除單筆資料
    else if(targetBtn=="delSingleOrder-Btn orderDelete"){
        deleteOrderItem(itemId);
    }

})

// 修改訂單狀態
function changeOrderStatus(itemStatus, itemId){
    //狀態切換條件
    let newItemStatus;
    if(itemStatus!=true){
        newItemStatus=true;
    }else{
        newItemStatus=false;
    };
    
    axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${apiPath}/orders`, 
        {
            "data": {
            "id": itemId,
            "paid": newItemStatus,
            },
        },
        {
            headers:{"authorization": token},
        })
    .then(function(response){
        alert("變更成功");
        getOrderList();
    })
}

// 刪除單筆資料
function deleteOrderItem(itemId){
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${apiPath}/orders/${itemId}`, 
        {headers:{"authorization": token}
    })
    .then(function(response){
        alert("刪除成功");
        getOrderList();
    })
}

// 刪除全部資料
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click", function(e){
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${apiPath}/orders`, 
        {headers:{"authorization": token}
            })
    .then(function(response){
        alert("全部刪除成功");
        getOrderList();
    })
    .catch(function(error){
        alert("已無訂單");
    })
})

