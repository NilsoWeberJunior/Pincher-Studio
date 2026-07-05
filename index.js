setTimeout(function() {
    const loading = document.getElementById("main_loading");
    if (loading) loading.remove();
    
    document.getElementById("MainMenu").style.display = "block";
    document.body.style.background = "linear-gradient(135deg, #00d9ff 20%, #00ff88 49%, #00ff22 70%) fixed"

    
}, 1500);