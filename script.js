// TODO : ZoomBox Zoom + Reset Button

function UpdateCanvasUserInput(){
	UserMaxIter = parseInt(UserInputIter.value);
	ActualIter.innerHTML="Actuellement : "+UserMaxIter;
	console.log(UserMaxIter,UserInputIter,UserInputIter.value);
	DrawMandel(UserMaxIter);
}

function Complex(im,re){
	this.re = re;
	this.im = im;
	this.abs = function(other){
		return Math.sqrt(this.re**2+this.im**2);
	}
	this.add = function(other){
	return new Complex(this.re+other.re,this.im+other.im);
	}
	this.mult = function(other){
	return new Complex(this.re*other.re - this.im*other.im , this.re*other.im + this.im*other.re);
	}
}

//Check if more efficient to create num inside
function AppartientMandelbrot(ValeurC,Iters){
	let Z = new Complex(0,0);
	for (let i=0;i<=Iters;i++) {
		if (Z.abs()>2){
			return i;
		}
		Z = Z.mult(Z).add(ValeurC);
	}
	return Iters;
}

function ColorPixel(X,Y,Color){
	ctx.fillStyle = Color;
	ctx.fillRect(X,Y,1,1);
}

function DrawMandel(maxIter){
	for (let x=0;x<canv.width;x++){
		for (let y=0;y<canv.height;y++){
			var XScaled = Center[0]+(x-canv.width/2)*(OffSetX/canv.width)
			var YScaled = -Center[1]+(y-canv.height/2)*(OffSetY/canv.height)
			var DivergRank = AppartientMandelbrot(new Complex(XScaled,YScaled),maxIter)
			if (DivergRank==maxIter){
				ColorPixel(x,y,"black");
			}
			else{
				if (maxIter<255){
					ColorPixel(x,y,"hsl(" + Math.round(DivergRank*255/maxIter) + ", 70%, 50%)");
				}else{
					ColorPixel(x,y,"hsl(" + DivergRank%255 + ", 70%, 50%)");
				}
			}
		}
	}
	document.getElementById("msg+").style.display="none";
	document.getElementById("msg-").style.display="none";
}

function ZoomOut(){
	console.log("Zooming out");
	OffSetX *= 2
	OffSetY *= 2
	UserMaxIter = UserMaxIter>30?UserMaxIter-10:20;
	ActualIter.innerHTML="Actuellement : "+UserMaxIter;
	document.getElementById("msg-").style.display="inline";
	setTimeout(DrawMandel,100,UserMaxIter);
}

const canv = document.getElementById("MandelbrotCanvas");
const controls = document.getElementById("ControlArea");
const UserInputIter = document.getElementById("IterationCount");
const FormIter = document.getElementById("form");
const ActualIter = document.getElementById("actualIter");
canv.width  = window.innerWidth;
canv.height = window.innerHeight;
controls.width  = window.innerWidth;
controls.height = window.innerHeight;
const InvAspectRatio = canv.height/canv.width;
const ctx = canv.getContext("2d");
const CurrentControlContext = controls.getContext('2d');
Center = [0,0]
OffSetX = 6
OffSetY = OffSetX*InvAspectRatio;
var MandelLengthXUnScaled;
var MandelLengthYUnScaled;
var UserMaxIter = 50;
ActualIter.innerHTML="Actuellement : "+UserMaxIter;
var ZoomBox = null;

FormIter.addEventListener('submit',(e) => {

	e.preventDefault();
})

controls.onmousedown = function(e){
	ZoomBox = [e.clientX, e.clientY, 0, 0];
}

controls.onmousemove = function(e){
	if (ZoomBox!=null){
        CurrentControlContext.lineWidth = 1;
	
        CurrentControlContext.clearRect(0, 0, controls.width, controls.height);
		
		var gradient = ctx.createLinearGradient(0, 0, controls.width, controls.height);
		gradient.addColorStop("0", "magenta");
		gradient.addColorStop("0.5", "blue");
		gradient.addColorStop("1", "magenta");
        CurrentControlContext.strokeStyle = gradient;
		ZoomBox[2] = e.clientX
		ZoomBox[3] = e.clientY
		CurrentRatio=Math.abs((ZoomBox[3]-ZoomBox[1])/(ZoomBox[2]-ZoomBox[0]))
		if(CurrentRatio<InvAspectRatio){
			MandelLengthXUnScaled=ZoomBox[2]-ZoomBox[0];
			MandelLengthYUnScaled=parseInt(Math.abs(ZoomBox[2]-ZoomBox[0])*InvAspectRatio*(ZoomBox[1]<ZoomBox[3]?1:-1));
			CurrentControlContext.strokeRect(
				ZoomBox[0], 
				ZoomBox[1], 
				MandelLengthXUnScaled,
				MandelLengthYUnScaled);
		}else{
			MandelLengthXUnScaled=parseInt(Math.abs(ZoomBox[3]-ZoomBox[1])/InvAspectRatio*(ZoomBox[0]<ZoomBox[2]?1:-1));
			MandelLengthYUnScaled=ZoomBox[3]-ZoomBox[1];
			CurrentControlContext.strokeRect(
				ZoomBox[0], 
				ZoomBox[1],
				MandelLengthXUnScaled,
				MandelLengthYUnScaled);
		}
	}
}

controls.onmouseup = function(e){
	CurrentControlContext.clearRect(0, 0, controls.width, controls.height);
	if (ZoomBox[3]<=5&&ZoomBox[2]<=5){
		ZoomOut();
	}else{
		console.log(Center)
		var NewCenterUnScaled = [
			(ZoomBox[0]+MandelLengthXUnScaled/2-canv.width/2)/canv.width,
			(ZoomBox[1]+MandelLengthYUnScaled/2-canv.height/2)/canv.height];
		Center = [Center[0]+NewCenterUnScaled[0]*OffSetX,Center[1]-NewCenterUnScaled[1]*OffSetY];
		OffSetX *= Math.abs(MandelLengthXUnScaled/(canv.width))
		OffSetY *= Math.abs(MandelLengthYUnScaled/(canv.height))
		console.log("DrawNew",NewCenterUnScaled,OffSetX,OffSetY,Center);
		UserMaxIter+=10;
		ActualIter.innerHTML="Actuellement : "+UserMaxIter;
		document.getElementById("msg+").style.display="inline";
		setTimeout(DrawMandel,100,UserMaxIter);
	}
	ZoomBox = null;
}

DrawMandel(UserMaxIter)
