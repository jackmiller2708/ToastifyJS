let toast = document.querySelector("el-toast");
    
for (let i = 0; i < 100; i++) {
    toast.publish({
        type: "success",
        description:
            i +
            " Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
        timeout: 8000
    });
    toast.publish({
        type: "danger",
        description:
            i +
            " Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        timeout: 8000
    });
    toast.publish({
        type: "info",
        description: i + " Lorem Ipsum is simply.",
        timeout: 0,
        actions: [
            {
                title: "OK",
                onClick: function() {
                    alert("OK");
                }
            }
        ]
    });
    let idToast = undefined;
    idToast = toast.publish({
        type: "info",
        description:
            i +
            " Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        timeout: 0,
        hideClose: true,
        actions: [
            {
                title: "OK",
                onClick: function() {
                    toast.remove(idToast);
                }
            }
        ]
    });
    toast.publish({
        type: "info",
        description: i + " Lorem Ipsum is simply.",
        timeout: 20000
    });
    toast.publish({
        type: "info",
        description: i + " Lorem Ipsum is simply.",
        timeout: 20000,
        actions: [
            {
                title: "Try again",
                onClick: function() {
                alert("Try again");
                }
            },
            {
                title: "Ignore",
                onClick: function() {
                alert("Ignore");
                }
            },
            {
                title: "Custom",
                onClick: function() {
                alert("Custom Button");
                }
            }
        ]
    });
    toast.publish({
        type: "alert",
        description:
            i +
            " Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book."
    });
    toast.publish({
        type: "alert",
        description:
            i +
            " Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book"
    });
}