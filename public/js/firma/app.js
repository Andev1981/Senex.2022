function loadImage(url) {
    return new Promise(resolve => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = "blob";
        xhr.onload = function (e) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const res = event.target.result;
                resolve(res);
            }
            const file = this.response;
            reader.readAsDataURL(file);
        }
        xhr.send();
    });
}

let signaturePad = null;

window.addEventListener('cargar-firma', async () => {

    const canvas = document.querySelector("canvas");
    canvas.height = canvas.offsetHeight;
    canvas.width = canvas.offsetWidth;
    const firmaDigitalizada = document.getElementById("firmaDigitalizada");
    firmaDigitalizada.setAttribute("value", "");

    signaturePad = new SignaturePad(canvas, {});
    signaturePad.isEmpty = true;

    const firmar = document.getElementById('btnFirmar')
    const limpiar = document.getElementById('btnLimpiar')
    const enviar = document.getElementById('btnEnviar')

    firmar.addEventListener('click',function(){
        if( signaturePad.isEmpty !== true){
            const signatureImage = signaturePad.toDataURL();
            firmaDigitalizada.setAttribute("value", signatureImage);
            firmar.setAttribute("style", "display:none");
            enviar.setAttribute("style", "display:inherit");
        }
    });

    limpiar.addEventListener('click',function(){
        canvas.height = canvas.offsetHeight;
        canvas.width = canvas.offsetWidth;
        signaturePad.isEmpty = true;
        firmaDigitalizada.setAttribute("value", "");
        firmar.setAttribute("style", "display:block");
        enviar.setAttribute("style", "display:none");
        firmar.setAttribute('disabled','disabled')
    });

    canvas.addEventListener('click',function(){
        signaturePad.isEmpty = false;
        firmar.removeAttribute('disabled')
    });


});


