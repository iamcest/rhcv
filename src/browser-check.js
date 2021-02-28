'use strict';

/**
 * This function checks if default function parameters are supported by the browser in question.
 * It's a very simplified way of detecting whether the browser supports basic ES6.
 * We can enhance it further if there are any specific features we require support for in the future.
 *
 * Supported browsers:
 * No IE
 * Edge/Edge Mobile 14+
 * Chrome/Chrome for Android 49+
 * Firefox 15+
 * Safari/Safari for iOS 10+
 * Opera/Opera for Android 36+
 * Samsung Internet 5+
 */
function supportsES6() {
  try {
    // tslint:disable-next-line:no-unused-expression
    new Function('(a = 0) => a');
    return true;
  } catch (err) {
    return false;
  }
}

function getBrowserDetails() {
  var userAgent = navigator.userAgent;
  var appName = navigator.appName;
  var appVersion = navigator.appVersion;

  var browserName = appName;
  var fullVersion = '' + parseFloat(appVersion);
  var nameOffset, verOffset, ix;

  if ((verOffset = userAgent.indexOf('Opera')) !== -1) {
    // In Opera, the true version is after 'Opera' or after 'Version'
    browserName = 'Opera';
    fullVersion = userAgent.substring(verOffset + 6);
    if ((verOffset = userAgent.indexOf('Version')) !== -1) {
      fullVersion = userAgent.substring(verOffset + 8);
    }
  } else if ((verOffset = userAgent.indexOf('MSIE')) !== -1) {
    // In MSIE, the true version is after 'MSIE' in userAgent
    browserName = 'Microsoft Internet Explorer';
    fullVersion = userAgent.substring(verOffset + 5);
  } else if (userAgent.indexOf('Trident') !== -1) {
    // In IE11, the true version is after 'rv:' in userAgent
    browserName = 'Microsoft Internet Explorer';
    var strStart = userAgent.indexOf('rv:') + 3;
    var strEnd = userAgent.indexOf(')');
    fullVersion = userAgent.substring(strStart, strEnd);
  } else if ((verOffset = userAgent.indexOf('Chrome')) !== -1) {
    // In Chrome, the true version is after 'Chrome'
    browserName = 'Chrome';
    fullVersion = userAgent.substring(verOffset + 7);
  } else if ((verOffset = userAgent.indexOf('Safari')) !== -1) {
    // In Safari, the true version is after 'Safari' or after 'Version'
    browserName = 'Safari';
    fullVersion = userAgent.substring(verOffset + 7);
    if ((verOffset = userAgent.indexOf('Version')) !== -1) {
      fullVersion = userAgent.substring(verOffset + 8);
    }
  } else if ((verOffset = userAgent.indexOf('Firefox')) !== -1) {
    // In Firefox, the true version is after 'Firefox'
    browserName = 'Firefox';
    fullVersion = userAgent.substring(verOffset + 8);
  } else if ((nameOffset = userAgent.lastIndexOf(' ') + 1) < (verOffset = userAgent.lastIndexOf('/'))) {
    // In most other browsers, 'name/version' is at the end of userAgent
    browserName = userAgent.substring(nameOffset, verOffset);
    fullVersion = userAgent.substring(verOffset + 1);
    if (browserName.toLowerCase() === browserName.toUpperCase()) {
      browserName = appName;
    }
  }

  // trim the fullVersion string at semicolon/space if present
  if ((ix = fullVersion.indexOf(';')) !== -1) {
    fullVersion = fullVersion.substring(0, ix);
  }
  if ((ix = fullVersion.indexOf(' ')) !== -1) {
    fullVersion = fullVersion.substring(0, ix);
  }

  return browserName + ' ' + fullVersion;
}

(function () {
  // This is supported in IE 8+
  document.onreadystatechange = function () {
    if (document.readyState === 'interactive') {
      if (!supportsES6()) {
        // Show unsupported browser fallback asking you to download a browser before Angular loads
        var fallback = document.getElementById('your-browser-is-crap');
        fallback.style.display = 'block';
        fallback.innerHTML =
          '<h1 style="font-size: 28px; line-height: 28px; margin-bottom: 14px;">Browser not supported</h1>' +
          '<div style="font-size: 16px;">' +
          '<p>The web browser you’re using (' + getBrowserDetails() + ') is not supported by this web site as the browser does not meet our <a href="https://cardihab.com/faq/#clinician-minimum-system-requirements" target="_blank">minimum system requirements</a>.</p>' +
          '<p>Please use one of the web browsers listed in our minimum system requirements for a faster, more secure and fully functional experience of the web.</p>' +
          '<p>Please visit <a href="https://cardihab.com/faq/#clinician-minimum-system-requirements" target="_blank">our FAQ</a> for more information, or email us at <a href="mailto:support@cardihab.com" target="_top">support@cardihab.com</a>.</p>' +
          '</div>';

        // Hide app root
        var appRoot = document.getElementById('app-root');
        appRoot.style.display = 'none';
      }
    }
  };
})();
