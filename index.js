setTimeout(function() {
    const loading = document.getElementById("main_loading");
    if (loading) loading.remove();
    
    document.getElementById("MainMenu").style.display = "block";
    document.body.style.background = "green";


    
}, 1500);