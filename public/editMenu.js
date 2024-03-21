$(() => {
    const menuId = $("#menuId").val();
    let img = null;
    $("#img").change((e) => {
        img = e.target.files[0];
    })
    $("#editMenuForm").submit((e) => {
        e.preventDefault();
        let name = $("#name").val();
        let description = $("#description").val();
        let price = Number($("#price").val());
        if (!name) {
            return alert("Please enter name")
        }
        if (!description) {
            return alert("Please enter description")
        }
        if (!price) {
            return alert("Please enter price")
        }
        if (price <= 0) return alert("Price should be greater than 0")

        const form = new FormData();
        form.set('name', name)
        form.set('price', price)
        form.set('description', description);
        if (img) {
            form.set('img', img);
        }

        const settings = {
            url: "/menu/editMenu/" + menuId,
            method: "PUT",
            timeout: 0,
            processData: false,
            mimeType: "multipart/form-data",
            contentType: false,
            data: form,
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
            const data = JSON.parse(response)
            alert(data.message);
        });
    })
    $("#deleteMenu").click(v => {
        v.preventDefault();
        if (!confirm("Are you sure to delete menu")) return
        const settings = {
            url: "/menu/editMenu/" + menuId, method: "DELETE", statusCode: {
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
            window.location.href = '/menu/restMenus';
        });
    })
})
