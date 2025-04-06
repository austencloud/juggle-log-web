// Add this to ensure page reloads if HMR isn't working
if (import.meta.hot) {
	import.meta.hot.accept(() => {
		console.log('HMR update detected, forcing page reload');
		window.location.reload();
	});
}
