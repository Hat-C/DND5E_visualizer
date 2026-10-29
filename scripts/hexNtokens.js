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
	for(const chil of statHexes.children) {
		chil.style.setProperty(`margin-${counter%newCount%2==0?"bottom":"top"}`,"0");
		chil.style.removeProperty(`margin-${counter%newCount%2==0?"top":"bottom"}`);
		++counter;
	}
}