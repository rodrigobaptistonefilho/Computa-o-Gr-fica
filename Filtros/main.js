var fileLoader = document.getElementById('fileLoader');
var image = document.getElementById('image');
var canvas = document.getElementById('image-canvas');
var context = null;

let loadFromFile = function(){
    fileLoader.click();
    fileLoader.addEventListener('input', ()=>{
        image.src = fileLoader.files[0].name;
    });
}

let load = function (){
    
    context = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    context.drawImage(image, 0, 0);
}

let vermelho = function () {
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    let img = new MatrixImage(imageData)
    for (var i = 0; i < img.width; i++) {
        for (var j = 0; j < img.height; j++) {
            var pixel = img.getPixel(i, j)
            img.setPixel(i, j, new RGBColor(pixel.red, 0, 0))
        }
    }
    context.putImageData(img.imageData, 0, 0)
}

let verde = function () {
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    let img = new MatrixImage(imageData)
    for (var i = 0; i < img.width; i++) {
        for (var j = 0; j < img.height; j++) {
            var pixel = img.getPixel(i, j)
            img.setPixel(i, j, new RGBColor(0, pixel.green, 0))
        }
    }
    context.putImageData(img.imageData, 0, 0)
}

let azul = function () {
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    let img = new MatrixImage(imageData)
    for (var i = 0; i < img.width; i++) {
        for (var j = 0; j < img.height; j++) {
            var pixel = img.getPixel(i, j)
            img.setPixel(i, j, new RGBColor(0, 0, pixel.blue))
        }
    }
    context.putImageData(img.imageData, 0, 0)
}

let escalaCinzaMedia = function() {
    var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;
    for (var i = 0; i < data.length; i+=4) {
        var red = data[i];
        var green = data[i+1];
        var blue = data[i+2];
        var gray = (red + green + blue) / 3; 
        data[i] = data[i+1] = data[i+2] = gray;
    }
    context.putImageData(imageData, 0, 0);
}

let escalaCinzaNTSC = function() {
    var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;
    for (var i = 0; i < data.length; i+=4) {
        var red = data[i];
        var green = data[i+1];
        var blue = data[i+2];
        var gray = (0.299*red) + (0.587*green) + (0.114*blue); 
        data[i] = data[i+1] = data[i+2] = gray;
    }
    context.putImageData(imageData, 0, 0);
}

let suavizacaoMedia = function() {
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    let img = new MatrixImage(imageData);
    for (var i = 0; i < img.width; i++) {        
        for (var j = 0; j < img.height; j++) {   
            var pixel = Array();
            //pegando os pixels do kernel e colocando no array pixel
            pixel.push(img.getPixel(i-1,j-1));
            pixel.push(img.getPixel(i-1,j));
            pixel.push(img.getPixel(i-1,j+1));
            pixel.push(img.getPixel(i,j-1));
            pixel.push(img.getPixel(i,j));
            pixel.push(img.getPixel(i,j+1));
            pixel.push(img.getPixel(i+1,j-1));
            pixel.push(img.getPixel(i+1,j));
            pixel.push(img.getPixel(i+1,j-1));

            var reds = Array();
            var greens = Array();
            var blues = Array();

            for( x = 0; x < pixel.length; x++){
                reds.push(pixel[x].red);
                greens.push(pixel[x].green);
                blues.push(pixel[x].blue);
            }

            var redMean = reds.reduce((a,b) => a + b) / reds.length;
            var greenMean = greens.reduce((a,b) => a + b) / greens.length;
            var blueMean = blues.reduce((a,b) => a + b) / blues.length;

            img.setPixel(i, j, new RGBColor(redMean, greenMean, blueMean));
        }
    }
    context.putImageData(img.imageData, 0, 0);
}

let suavizacaoMediana = function() {
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    let img = new MatrixImage(imageData);
    
    for (var i = 1; i < img.width+1; i++) {        
        for (var j = 1; j < img.height+1; j++) {   

            var px = Array();
            px.push(rgbToHsl(img.getPixelArray(i-1,j-1)));
            px.push(rgbToHsl(img.getPixelArray(i-1,j)));
            px.push(rgbToHsl(img.getPixelArray(i-1,j+1)));

            px.push(rgbToHsl(img.getPixelArray(i,j-1)));
            px.push(rgbToHsl(img.getPixelArray(i,j)));
            px.push(rgbToHsl(img.getPixelArray(i,j+1)));

            px.push(rgbToHsl(img.getPixelArray(i+1,j-1)));
            px.push(rgbToHsl(img.getPixelArray(i+1,j)));
            px.push(rgbToHsl(img.getPixelArray(i+1,j-1)));

            var h = Array();
            var s = Array();
            var l = Array();

            for (let index = 0; index < px.length; index++) {
                h.push(px[index][0]);
                s.push(px[index][1]); 
                l.push(px[index][2]); 
            }

            function sortfunction(a, b){
                return (a - b)
            }

            h.sort(sortfunction);
            s.sort(sortfunction);
            l.sort(sortfunction);

            var rgb = HSLToRGB(h[4],s[4],l[4]);

            var red = rgb[0];
            var green = rgb[1];
            var blue = rgb[2];
            img.setPixel(i, j, new RGBColor(red, green, blue));
        }
    }
    context.putImageData(img.imageData, 0, 0);
}

let suavizacaoGaussian = function() {
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    let px = imageData.data;
    let tempPx = new Uint8ClampedArray(px.length);
    tempPx.set(px);

    for(i = 0; i < px.length; i++){
        if(i % 2 ===3 ){ continue;}

        px[i] = (tempPx[i] + 
                 (tempPx[i - 4]) + 
                 (tempPx[i + 4]) + 
                 (tempPx[i - 4 * imageData.width]) + 
                 (tempPx[i + 4 * imageData.width]) + 
                 (tempPx[i - 4 * imageData.width - 4]) +
                 (tempPx[i + 4 * imageData.width + 4]) +
                 (tempPx[i + 4 * imageData.width - 4]) +
                 (tempPx[i - 4 * imageData.width + 4]) 
                 ) / 9;
    }

    context.putImageData(imageData, 0, 0);
}

let limiarizacaoBinaria = function(){
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    let img = new MatrixImage(imageData);
    let maxValue = 255;
    let thresh = 60;
    for (var i = 0; i < img.width; i++) {        
        for (var j = 0; j < img.height; j++) {   

            var red = img.getPixel(i,j).red;
            var green = img.getPixel(i,j).green;
            var blue = img.getPixel(i,j).blue;
            var meanPixel = ( red + green + blue ) / 3;

            if(meanPixel < thresh){
                img.setPixel(i,j, new RGBColor(maxValue, maxValue, maxValue));
            }else{
                img.setPixel(i,j, new RGBColor(0, 0, 0));
            }
        }
    }
    context.putImageData(img.imageData, 0, 0);
}
let brilho = function () {
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    let img = new MatrixImage(imageData)
    const brightness = 1.2

    for (var i = 1; i < img.width; i++) {
        for (var j = 1; j < img.height; j++) {
            var pixel = img.getPixel(i, j)
            newR = pixel.red * brightness
            newG = pixel.green * brightness
            newB = pixel.blue * brightness
            img.setPixel(i, j, new RGBColor(newR, newG, newB))
        }
    }
    context.putImageData(img.imageData, 0, 0)
}
let contraste = function () {
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    let img = new MatrixImage(imageData)

    const fator_contraste = 2
    const add = 200

    for (var i = 1; i < img.width; i++) {
        for (var j = 1; j < img.height; j++) {
            var pixel = img.getPixel(i, j)
            newR = fator_contraste * (pixel.red - add) + add
            newG = fator_contraste * (pixel.green - add) + add
            newB = fator_contraste * (pixel.blue - add) + add
            img.setPixel(i, j, new RGBColor(newR, newG, newB))
            img.setPixel(i, j, new RGBColor(newR, newG, newB))
        }
    }
    context.putImageData(img.imageData, 0, 0)
}

let girar90 = function(){
    context.clearRect(0,0,canvas.width,canvas.height);
    context.save();
    canvas.width = image.height;
    canvas.height = image.width;
    context.translate(canvas.width/2,canvas.height/2);
    context.rotate(Math.PI/2);
    context.drawImage(image, -image.width/2, -image.height/2);
    context.restore();
}

let flipHorizontal = function(){
    context.clearRect(0,0,canvas.width,canvas.height);
    context.save();
    context.translate(canvas.width/2,canvas.height/2);
    context.rotate(180*Math.PI/180);
    context.drawImage(image, -image.width/2, -image.height/2);
    context.restore();
}

let flipVertical = function(){
    context.clearRect(0,0,canvas.width,canvas.height);
    context.save();
    canvas.width = image.height;
    canvas.height = image.width;
    context.translate(canvas.width/2,canvas.height/2);
    context.rotate(270*Math.PI/180);
    context.drawImage(image, -image.width/2, -image.height/2);
    context.restore();
}


function HSLToRGB(h,s,l) {
    s /= 100;
    l /= 100;
  
    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = l - c/2,
        r = 0,
        g = 0,
        b = 0;
  
      if (0 <= h && h < 60) {
          r = c; g = x; b = 0;  
      } else if (60 <= h && h < 120) {
          r = x; g = c; b = 0;
      } else if (120 <= h && h < 180) {
          r = 0; g = c; b = x;
      } else if (180 <= h && h < 240) {
          r = 0; g = x; b = c;
      } else if (240 <= h && h < 300) {
          r = x; g = 0; b = c;
      } else if (300 <= h && h < 360) {
          r = c; g = 0; b = x;
    }
  
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
  
    return new Array(r, g, b);
}
  
function rgbToHsl(c) {
    var r = c[0]/255, g = c[1]/255, b = c[2]/255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return new Array(h * 360, s * 100, l * 100);
}

class RGBColor {
    constructor(r, g, b) {
      this.red = r;
      this.green = g; 
      this.blue = b;
    }
}

class MatrixImage {
    constructor(imageData) {
      this.imageData = imageData;
      this.height = imageData.height; 
      this.width = imageData.width;
    }

    getPixel(x, y) {
        let position = ((y * (this.width * 4)) + (x * 4));

        return new RGBColor(
             this.imageData.data[position],   //red
             this.imageData.data[position+1], //green
             this.imageData.data[position+2], //blue
        );
    }

    getPixelArray(x,y){
        let position = ((y * (this.width * 4)) + (x * 4));

        return new Array(
            this.imageData.data[position],   //red
            this.imageData.data[position+1], //green
            this.imageData.data[position+2], //blue
        );
    }

    setPixel(x, y, color) {
        let position = ((y * (this.width * 4)) + (x * 4));
        this.imageData.data[position] = color.red;
        this.imageData.data[position+1] = color.green;
        this.imageData.data[position+2] = color.blue;
    }
}

document.getElementById('btnCarregar').addEventListener('click', load);
document.getElementById('btnVermelho').addEventListener('click', vermelho);
document.getElementById('btnVerde').addEventListener('click', verde);
document.getElementById('btnAzul').addEventListener('click', azul);
document.getElementById('btnEscalaCinzaMedia').addEventListener('click', escalaCinzaMedia);
document.getElementById('btnEscalaCinzaNTSC').addEventListener('click', escalaCinzaNTSC);
document.getElementById('btnSuavizacaoMedia').addEventListener('click', suavizacaoMedia);
document.getElementById('btnSuavizacaoMediana').addEventListener('click', suavizacaoMediana);
document.getElementById('btnSuavizacaoGaussian').addEventListener('click', suavizacaoGaussian);
document.getElementById('btnLimiarizacaoBinaria').addEventListener('click', limiarizacaoBinaria);
document.getElementById('btnBrilho').addEventListener('click', brilho)
document.getElementById('btnContraste').addEventListener('click', contraste)
document.getElementById('btnGirar90').addEventListener('click', girar90);
document.getElementById('btnFlipHorizontal').addEventListener('click', flipHorizontal);
document.getElementById('btnFlipVertical').addEventListener('click', flipVertical);
