const userAgent = window.navigator.userAgent.toLowerCase();
const isOldIos = /iphone os 12/.test(userAgent);

/**
 * Apply 'oldIos' attribute to <html></html>
 */
function applyOldIos() {
  if (isOldIos) {
    document.documentElement.setAttribute('old-ios', 'true');
  }
}

export {
  // eslint-disable-next-line import/prefer-default-export
  applyOldIos,
};
