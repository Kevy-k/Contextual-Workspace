const pageTitle=document.title;
const h1Element=document.querySelector('h1');

const mainHeading=h1Element ? h1Element.innerText.trim():'';

const apiText=`${pageTitle} | ${mainHeading}`;
chrome.runtime.executeScript({
    action:'sendTitle',
    title:apiText
});