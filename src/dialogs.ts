export function styleForPopup(){
	document.body.style.overflow = 'auto';
	document.body.style.touchAction = 'auto';
}

export function styleForNoPopup(){
	document.body.style.overflow = '';
	document.body.style.touchAction = '';
	window.scrollTo({top: 0, behavior: 'smooth'});
}
