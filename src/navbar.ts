const body = document.getElementById("body")!;

const links = {
  index:
    "<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>\
<path d='M23.67 9.56005L21.67 7.74005L14 0.780046C13.45 0.288091 12.738 0.0161133 12 0.0161133C11.2621 0.0161133 10.55 0.288091 10 0.780046L2.35002 7.78005L0.350019 9.60005C0.215344 9.7367 0.122823 9.9092 0.0834928 10.097C0.0441625 10.2848 0.0596837 10.4799 0.128204 10.6591C0.196725 10.8383 0.315353 10.994 0.469935 11.1077C0.624518 11.2213 0.80853 11.2881 1.00002 11.3C1.25331 11.2886 1.49279 11.1814 1.67002 11L2.00002 10.7V21C2.00002 21.7957 2.31609 22.5588 2.8787 23.1214C3.44131 23.684 4.20437 24 5.00002 24H19C19.7957 24 20.5587 23.684 21.1213 23.1214C21.6839 22.5588 22 21.7957 22 21V10.74L22.33 11.04C22.5134 11.2067 22.7522 11.2994 23 11.3C23.2016 11.2995 23.3984 11.2381 23.5645 11.1237C23.7305 11.0094 23.8582 10.8475 23.9306 10.6594C24.0031 10.4712 24.017 10.2656 23.9704 10.0694C23.9239 9.8732 23.8192 9.69566 23.67 9.56005Z' fill='black'/></svg>",
  transaction:
    '<svg width="28" height="22" viewBox="0 0 28 22" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
    '<path d="M18.1301 12.93V13.93C18.1301 14.5866 18.0007 15.2368 17.7495 15.8434C17.4982 16.45 17.1299 17.0012 16.6656 17.4655C16.2013 17.9298 15.6501 18.2981 15.0435 18.5494C14.4369 18.8006 13.7867 18.93 13.1301 18.93H9.87007C9.85465 19.4768 9.68997 20.0091 9.39386 20.4691C9.09775 20.9292 8.68147 21.2995 8.19007 21.54C7.78024 21.7447 7.32822 21.8509 6.87007 21.85C6.19234 21.854 5.53322 21.6284 5.00007 21.21L1.29007 18.3C0.928742 18.0195 0.636313 17.6602 0.435145 17.2494C0.233976 16.8387 0.129395 16.3874 0.129395 15.93C0.129395 15.4726 0.233976 15.0213 0.435145 14.6105C0.636313 14.1997 0.928742 13.8404 1.29007 13.56L5.00007 10.65C5.44707 10.2932 5.98673 10.0717 6.55545 10.0114C7.12417 9.9512 7.69826 10.0548 8.21007 10.31C8.8916 10.6359 9.41647 11.2183 9.67007 11.93H17.1001C17.2339 11.926 17.3672 11.9489 17.492 11.9973C17.6168 12.0458 17.7306 12.1188 17.8267 12.212C17.9227 12.3053 17.9991 12.4169 18.0512 12.5402C18.1033 12.6636 18.1301 12.7961 18.1301 12.93Z" fill="black"/>\n' +
    '<path d="M27.8701 6.06995C27.8702 6.52728 27.7657 6.97857 27.5647 7.38934C27.3636 7.8001 27.0713 8.15946 26.7101 8.43995L23.0001 11.35C22.4595 11.77 21.7947 11.9986 21.1101 12C20.652 12.0009 20.2 11.8947 19.7901 11.69C19.1086 11.364 18.5837 10.7816 18.3301 10.07H10.8701C10.6049 10.07 10.3505 9.9646 10.163 9.77706C9.97547 9.58952 9.87012 9.33517 9.87012 9.06995V8.06995C9.87012 6.74387 10.3969 5.4721 11.3346 4.53442C12.2723 3.59674 13.544 3.06995 14.8701 3.06995H18.1301C18.1423 2.5109 18.3105 1.96638 18.6157 1.49784C18.9209 1.02929 19.351 0.655373 19.8574 0.418276C20.3638 0.18118 20.9264 0.0903436 21.4817 0.156018C22.0371 0.221693 22.563 0.441264 23.0001 0.789954L26.7101 3.69995C27.0713 3.98045 27.3636 4.33981 27.5647 4.75057C27.7657 5.16134 27.8702 5.61263 27.8701 6.06995Z" fill="black"/>\n' +
    "</svg>\n",
  category:
    '<svg width="32" height="25" viewBox="0 0 32 25" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n' +
    '<rect width="32" height="25" fill="url(#pattern0_40_203)"/>\n' +
    "<defs>\n" +
    '<pattern id="pattern0_40_203" patternContentUnits="objectBoundingBox" width="1" height="1">\n' +
    '<use xlink:href="#image0_40_203" transform="matrix(0.00152588 0 0 0.00195312 0.109375 0)"/>\n' +
    "</pattern>\n" +
    '<image id="image0_40_203" width="512" height="512" xlink:href="data:image/png;base64,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"/>\n' +
    "</defs>\n" +
    "</svg>\n",
  budget:
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
    '<path d="M24 11H13V0C15.8412 0.228368 18.5083 1.46063 20.5239 3.47614C22.5394 5.49166 23.7716 8.1588 24 11Z" fill="black"/>\n' +
    '<path d="M24 13C23.801 15.2756 22.9566 17.4471 21.566 19.2594C20.1754 21.0716 18.2965 22.4493 16.15 23.2306C14.0035 24.0119 11.6786 24.1643 9.44844 23.6699C7.2183 23.1755 5.1756 22.0549 3.56038 20.4396C1.94515 18.8244 0.82449 16.7817 0.330092 14.5516C-0.164306 12.3214 -0.011906 9.99652 0.769384 7.85001C1.55067 5.7035 2.92839 3.82457 4.74065 2.43401C6.55292 1.04346 8.72442 0.199045 11 0V12C11 12.2652 11.1054 12.5196 11.2929 12.7071C11.4804 12.8946 11.7348 13 12 13H24Z" fill="black"/>\n' +
    "</svg>\n",
  profile:
    '<svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
    '<path d="M10 12.07C13.3137 12.07 16 9.38372 16 6.07001C16 2.7563 13.3137 0.0700073 10 0.0700073C6.68629 0.0700073 4 2.7563 4 6.07001C4 9.38372 6.68629 12.07 10 12.07Z" fill="black"/>\n' +
    '<path d="M13 14H7C5.14348 14 3.36301 14.7375 2.05025 16.0503C0.737498 17.363 0 19.1435 0 21C0 21.7956 0.316071 22.5587 0.87868 23.1213C1.44129 23.6839 2.20435 24 3 24H17C17.7956 24 18.5587 23.6839 19.1213 23.1213C19.6839 22.5587 20 21.7956 20 21C20 19.1435 19.2625 17.363 17.9497 16.0503C16.637 14.7375 14.8565 14 13 14Z" fill="black"/>\n' +
    "</svg>\n",
};

const navbar = document.createElement("header");
const navItems = document.createElement("ul");
navItems.classList.add("navigation--items");
const logout = document.createElement("a");

for (const [link, label] of Object.entries(links)) {
  const li = document.createElement("li");
  const a = document.createElement("a");
  a.innerHTML = label;
  a.href = `./${link}.html`;
  a.classList.add("navlink");
  li.appendChild(a);
  navItems.appendChild(li);
}

logout.innerHTML =
  '<svg width="33" height="42" viewBox="0 0 33 42" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
  '<path d="M16.334 20.715H31.6679M31.6679 20.715L25.0962 27.2866M31.6679 20.715L25.0962 14.1433" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>\n' +
  '<path d="M31.6678 7.57166V5.38111C31.6678 2.96149 29.7063 1 27.2866 1H5.38111C2.96149 1 1 2.96149 1 5.38111V36.0489C1 38.4685 2.96149 40.43 5.38111 40.43H27.2866C29.7063 40.43 31.6678 38.4685 31.6678 36.0489V33.8583" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>\n' +
  "</svg>\n";
logout.classList.add("logout", "navlink");
logout.href = "#";

navbar.appendChild(navItems);
navbar.appendChild(logout);
navbar.className = "header";

body.insertBefore(navbar, body.firstChild);
