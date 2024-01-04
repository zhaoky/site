export function changeSearchDetailView(showDetail = true) {
  localStorage.setItem('vitepress:local-search-detailed-list', `${showDetail}`);
}
