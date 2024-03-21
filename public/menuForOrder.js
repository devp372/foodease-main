let restId;
$(() => {
    const id = $("#restId").val();
    restId = id;
    if (!id) {
        return alert("Restaurant not found")
    }
    const settings = {
        "url": "/user/menuList/api/" + id,
        "method": "GET",
        "timeout": 0,
        "processData": false,
        "contentType": false,
        "headers": {
            "Content-Type": "application/json"
        },
        statusCode: {
            400: function (res) {
                const data = JSON.parse(res.responseText)
                $("#placeOrder").hide();
                $("#errorMessage").text(data.message).removeClass('visibility-hidden');
            }, 403: function () {
                alert("Unauthenticated");
                window.location.reload()
            }
        }
    };
    $.ajax(settings).done(function (response) {
        attachView(response)
    });
})

const attachView = (data) => {
    if (!Array.isArray(data) || data.length === 0) {
        $("#placeOrder").hide();
        $("#warningMessage").text("Empty menu list").removeClass('visibility-hidden');
        return
    }
    const v = data.reduce((p, v) => {
        return p + getItemCard(v);
    }, ``);
    const ele = $(v);
    $("#menuContainer").replaceWith(ele);
    bindEvent(data)
}
const bindEvent = (data) => {
    data.forEach(v => {
        $(`#${v._id}_desc`).click(() => addNumber(v._id, -1))
        $(`#${v._id}_inc`).click(() => addNumber(v._id, 1))
    });

    $("#placeOrder").click(() => {
        prepareOrder(data);
    })
    attachFavouriteListener();
}

const attachFavouriteListener = () => {
    $(".markFavourite").click(function (e) {
        e.preventDefault();
        const url = $(this).attr('href');
        makeFavouriteAndRemoveFavouriteRequest(url, true);
    })
    $(".removeFavourite").click(function (e) {
        e.preventDefault();
        const url = $(this).attr('href');
        makeFavouriteAndRemoveFavouriteRequest(url, false);
    })
}

const makeFavouriteAndRemoveFavouriteRequest = (url, isFav) => {
    const settings = {
        url, method: "PUT", statusCode: {
            400: function (res) {
                const data = JSON.parse(res.responseText)
                alert(data.message);
            }, 403: function () {
                alert("Unauthenticated");
                window.location.reload()
            }
        }
    };

    $.ajax(settings).done(function (response) {
        alert(response.message);
        const newUrl = isFav ? url.replace("markFavouriteItem", "removeFavouriteItem") : url.replace("removeFavouriteItem", "markFavouriteItem");
        if (isFav) {
            $(`[href="${url}"]`).replaceWith(`<a class="btn btn-danger removeFavourite" href="${newUrl}">Remove Favourite</a>`)
        } else {
            $(`[href="${url}"]`).replaceWith(`<a class="btn btn-primary removeFavourite" href="${newUrl}">Mark Favourite</a>`)
        }
        $(`[href="${newUrl}"]`).click(function (e) {
            e.preventDefault();
            const url = $(this).attr('href');
            makeFavouriteAndRemoveFavouriteRequest(url, !isFav);
        })
    });
}

const prepareOrder = (data) => {
    const arr = [];
    data.forEach(v => {
        const val = Number($(`#${v._id}_page`).text());
        if (!val || val <= 0) return;
        arr.push({id: v._id, count: val});
    })
    if (arr.length === 0) {
        return alert("Please select some items")
    }
    placeOrder(arr);
}

const placeOrder = (arr) => {
    if (arr.length === 0 || !restId) return
    if (!confirm("Are you sure to place order")) return;
    const data = {
        restId, arr
    }
    const settings = {
        url: "/order/placeOrder/", method: "POST", timeout: 0, data, statusCode: {
            400: function (res) {
                const data = JSON.parse(res.responseText)
                alert(data.message);
            }, 403: function () {
                alert("Unauthenticated");
                window.location.reload()
            }
        }
    };
    $.ajax(settings).done(function (response) {
        alert(response.message);
    });
}

const addNumber = (id, num) => {
    const selector = $(`#${id}_page`);
    let value = selector.text();
    value = Number(value);
    if (!Number.isInteger(value)) {
        return alert("Value should be a number")
    }
    value = value + num;
    if (value < 0) {
        return alert("Value should not be negative")
    }
    selector.text(value);
}

const getItemCard = (item) => {
    return `
        <div class="col-lg-4 mt-2">
            <div class="menu-container">
                <div class="menu-heading">
                    <p>${item.name}</p>
                    <p class="flex-1"></p>
                    <p>${item.price}$</p>
                </div>
                <img src="${item.img}" class="menu-img" alt="Menu Photo">
                <p class="menu-description">${item.description}</p>
                <div class="flex-horizontal flex-center menu-price">
                    <button class="btn desc" id="${item._id}_desc">-</button>
                    <p  id="${item._id}_page">${item._count ? item._count : 0}</p>
                    <button class="btn inc" id="${item._id}_inc">+</button>
                </div>
                <div class="flex-horizontal flex-center menu-price">
                    <div class="flex-1"></div>
                    ${item.isFav ? `
                    <a class="btn btn-danger removeFavourite" href="/user/removeFavouriteItem/${item._id}">Remove Favourite</a>` : `
                    <a class="btn btn-primary markFavourite" href="/user/markFavouriteItem/${item._id}">Mark Favourite</a>`}
                </div>
                <div class="flex-vertical flex-center menu-links">
                    <a href="/reviews/menuReview/${item._id}">View Review</a>
                    <a href="/reviews/writeMenuItemReview/${item._id}">Give Review</a>
                    <a href="/user/viewMenu/${item._id}">View</a>
                </div>
            </div>
        </div>`;
}
