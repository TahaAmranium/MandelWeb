// TODO : ZoomBox Zoom + Reset Button

//Permet de regénérer la fractale une fois que l'utilisateur return/utilise le bouton
function UpdateCanvasUserInput(){
	UserMaxIter = parseInt(UserInputIter.value);
	ActualIter.innerHTML="Actuellement : "+UserMaxIter;
	console.log(UserMaxIter,UserInputIter,UserInputIter.value);
	document.getElementById("msgUpdate").style.display="inline";
	setTimeout(DrawMandel,10,UserMaxIter);
}

//La fonction Complex est un constructeur qui associe à une variable tout ce qu'il peut y avoir dans un complexe
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

//Cette fonction permet de réitérer la suite u(n+1) = u(n)^2 + c pour voir si un pixel appartient à l'ensemble ou non
//Je dois aussi check si ce ne serait pas mieux de créer le complexe au sein même de la fonction plutôt que de le recevoir en paramètre
function AppartientMandelbrot(ValeurC,Iters){
	let Z = new Complex(0,0);
	for (let i=0;i<=Iters;i++) {
		if (Z.abs()>2){
			return i;
		}
		Z = Z.mult(Z).add(ValeurC);
	}
	return Iters;
} //La fonction renvoie le nombre d'itérations maximal avant qu'on soit surs que la suite diverge, ou le nombre maximal d'itérations si elle ne diverge pas

//Cette fonction colorie un pixel donné
function ColorPixel(X,Y,Color){
	ctx.fillStyle = Color;
	ctx.fillRect(X,Y,1,1);
}

//Réitère la fonction AppartientMandelbrot sur tous les pixels à l'écran, après une mise à l'échelle de leurs coordonnées :
function DrawMandel(maxIter){
	for (let x=0;x<canv.width;x++){
		for (let y=0;y<canv.height;y++){
			var XScaled = Center[0]+(x-canv.width/2)*(OffSetX/canv.width)
			var YScaled = -Center[1]+(y-canv.height/2)*(OffSetY/canv.height)
			var DivergRank = AppartientMandelbrot(new Complex(XScaled,YScaled),maxIter)
			if (DivergRank==maxIter){
				//Si on atteint le max, ça ne diverge pas
				ColorPixel(x,y,"black");
			}
			else{
				if (maxIter<255){
					//Dans le cas où maxIter est inférieur à 255, on peut juste utiliser un produit en croix pour trouver la couleur correspondante :
					ColorPixel(x,y,"hsl(" + Math.round(DivergRank*255/maxIter) + ", 70%, 50%)");
				}else{
					//Sinon, pour apporter plus de nuance, on passe à une autre approche :
					ColorPixel(x,y,"hsl(" + DivergRank%255 + ", 70%, 50%)");
				}
			}
		}
	}
	//On enlève le message "Loading" :
	document.getElementById("msg+").style.display="none";
	document.getElementById("msg-").style.display="none";
	document.getElementById("msgUpdate").style.display="none";
}

//Fonction pour le DéZoom
function ZoomOut(){
	console.log("Zooming out");
	OffSetX *= 5
	OffSetY *= 5
	//Vérifie qu'on ne descend pas en dessous de 20 itérations, le minimum potable selon moi
	UserMaxIter = UserMaxIter>30?UserMaxIter-10:20;
	//Met à jour l'UI (avec un Loading notamment)
	ActualIter.innerHTML="Actuellement : "+UserMaxIter;
	document.getElementById("msg-").style.display="inline";
	//setTimeout permet d'update l'UI avant la fin de l'exécution de la fonction
	setTimeout(DrawMandel,10,UserMaxIter);
}

//Variables initiales
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
CurrentControlContext.lineWidth = 1;
var gradient = ctx.createLinearGradient(0, 0, controls.width, controls.height);
gradient.addColorStop("0", "magenta");
gradient.addColorStop("0.5", "blue");
gradient.addColorStop("1", "magenta");
CurrentControlContext.strokeStyle = gradient;
//Center : coordonnées du centre sur le plan complexe
Center = [0,0]
//OffsetX/Y : Longueur/Largeur de l'écran sur le plan complexe
OffSetX = 6
OffSetY = OffSetX*InvAspectRatio;
var MandelLengthXUnScaled;
var MandelLengthYUnScaled;
var UserMaxIter = 50;
ActualIter.innerHTML="Actuellement : "+UserMaxIter;
var ZoomBox = null;

//Ne permet pas au JS de gérer les boutons avec ses fonctions par défaut.
FormIter.addEventListener('submit',(e) => {
	e.preventDefault();
})

//Crée une nouvelle boîte de Zoom sur un click
controls.onmousedown = function(e){
	ZoomBox = [e.clientX, e.clientY, 0, 0];
}

//Sur un mouvement de la souris...
controls.onmousemove = function(e){
	if (ZoomBox!=null){
		//Efface tout ce qu'il y a à l'écran sauf la fractale et le texte d'aide
        CurrentControlContext.clearRect(0, 0, controls.width, controls.height);
		//Récupère l'input de l'user, et définit le ratio largeur/longueur du rectangle
		ZoomBox[2] = e.clientX
		ZoomBox[3] = e.clientY
		CurrentRatio=Math.abs((ZoomBox[3]-ZoomBox[1])/(ZoomBox[2]-ZoomBox[0]))
		if(CurrentRatio<InvAspectRatio){
			//Si ce ratio est inférieur à celui de la fenêtre, on modifie adéquatement le rectangle dessiné pour qu'il soit proportionnel à cette dernière
			MandelLengthXUnScaled=ZoomBox[2]-ZoomBox[0];
			MandelLengthYUnScaled=parseInt(Math.abs(ZoomBox[2]-ZoomBox[0])*InvAspectRatio*(ZoomBox[1]<ZoomBox[3]?1:-1));
			CurrentControlContext.strokeRect(
				ZoomBox[0], 
				ZoomBox[1], 
				MandelLengthXUnScaled,
				MandelLengthYUnScaled);
		}else{
			//Si ce ratio est supérieur à celui de la fenêtre, on modifie adéquatement le rectangle dessiné pour qu'il soit proportionnel à cette dernière
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

//Quand on relâche la souris :
controls.onmouseup = function(e){
	//On efface le rectangle de l'utilisateur
	CurrentControlContext.clearRect(0, 0, controls.width, controls.height);
	//Quand la boîte est trop petite, on peut se dire que c'est une erreur de l'utilisateur souhaitant dézoomer : on dézoome donc.
	if (ZoomBox[3]<=10&&ZoomBox[2]<=10){
		ZoomOut();
	//Sinon, on calcule le nouveau centre et les nouveaux Offsets à partir des valeurs fournies, et on redessine la fractale.
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
		//setTimeout permet d'update l'UI avant la fin de l'exécution de la fonction
		setTimeout(DrawMandel,10,UserMaxIter);
	}
	//Quoi qu'il en soit, on reset la boîte de Zoom
	ZoomBox = null;
}

//Premier dessin de la fractale
DrawMandel(UserMaxIter)