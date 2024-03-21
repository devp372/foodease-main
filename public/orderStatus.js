$(() => {
    const orderId = $("#orderId").val();
    $("#cancelOrder").click((e) => {
        e.preventDefault();
        cancelOrder(orderId);
    })
    $("#acceptOrder").click((e) => {
        e.preventDefault();
        acceptOrder(orderId);
    })
    $("#readyOrder").click((e) => {
        e.preventDefault();
        readyOrder(orderId);
    })
    $("#deliveredOrder").click((e) => {
        e.preventDefault();
        deliveredOrder(orderId);
    })
})

const cancelOrder = (id) => {
    if (!confirm("Are you sure to cancel order")) return
    const settings = {
        url: "/order/cancelOrder/" + id,
        method: "PUT",
        statusCode: {
            400: function (res) {
                const data = JSON.parse(res.responseText)
                alert(data.message);

                window.location.reload()
            }, 403: function () {
                alert("Unauthenticated");
                window.location.reload()
            }
        }
    };

    $.ajax(settings).done(function (response) {
        alert(response.message);
        window.location.reload();
    });
}

const acceptOrder = (id) => {
    if (!confirm("Are you sure to accept order")) return
    const settings = {
        url: "/order/acceptOrder/" + id,
        method: "PUT",
        statusCode: {
            400: function (res) {
                const data = JSON.parse(res.responseText)
                alert(data.message);

                window.location.reload()
            }, 403: function () {
                alert("Unauthenticated");
                window.location.reload()
            }
        }
    };

    $.ajax(settings).done(function (response) {
        alert(response.message);
        window.location.reload();
    });
}

const readyOrder = (id) => {
    if (!confirm("Are you sure order is ready !")) return
    const settings = {
        url: "/order/readyOrder/" + id,
        method: "PUT",
        statusCode: {
            400: function (res) {
                const data = JSON.parse(res.responseText)
                alert(data.message);

                window.location.reload()
            }, 403: function () {
                alert("Unauthenticated");
                window.location.reload()
            }
        }
    };
    $.ajax(settings).done(function (response) {
        alert(response.message);
        window.location.reload();
    });
}

const deliveredOrder = (id) => {
    if (!confirm("Are you sure order is ready !")) return
    const settings = {
        url: "/order/deliveredOrder/" + id,
        method: "PUT",
        statusCode: {
            400: function (res) {
                const data = JSON.parse(res.responseText)
                alert(data.message);
                window.location.reload()
            }, 403: function () {
                alert("Unauthenticated");
                window.location.reload()
            }
        }
    };
    $.ajax(settings).done(function (response) {
        alert(response.message);
        window.location.reload();
    });
}
