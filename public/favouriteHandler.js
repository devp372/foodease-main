$(() => {
    $(".markFavourite").click(function (e) {
        e.preventDefault();
        const url = $(this).attr('href');
        makeFavouriteAndRemoveFavouriteRequest(url);
    })
    $(".removeFavourite").click(function (e) {
        e.preventDefault();
        const url = $(this).attr('href');
        makeFavouriteAndRemoveFavouriteRequest(url);
    })
})
const makeFavouriteAndRemoveFavouriteRequest = (url) => {
    const settings = {
        url,
        method: "PUT",
        statusCode: {
            400: function (res) {
                const data = JSON.parse(res.responseText)
                alert(data.message);
                window.location.reload();
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


