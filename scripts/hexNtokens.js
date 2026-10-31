/*
	this js is for
		1. the positioning of stat hexes (which are currently being revised)
		2. the token specific functions
*/

const statHexes = document.getElementById("statHexes");
document.getElementById("Num-hexRowMax").max = statHexes.children.length;

document.getElementById("Num-hexRowMax").addEventListener("input", (event) => {fixHoneyComb()});
document.getElementById("Num-hexSideLength").addEventListener("input", function() { statHexes.style.setProperty("--sideLength", this.value); });

fixHoneyComb(document.getElementById("Num-hexRowMax").value);

function fixHoneyComb() {
	let newCount = Number(document.getElementById("Num-hexRowMax").value);
	if(newCount==0) { newCount = document.getElementById("Num-hexRowMax").max; }
	statHexes.style.setProperty("--maxRow", newCount);
	let counter = 0;
	for(const hex of statHexes.children) {
		hex.style.setProperty(`margin-${counter%newCount%2==0?"bottom":"top"}`,"0");
		hex.style.removeProperty(`margin-${counter%newCount%2==0?"top":"bottom"}`);
		++counter;
	}
}