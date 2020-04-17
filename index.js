/**
 * Author: Alex Shaw
 * Date: 4/16/20
 */
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

/**
 * Fetches the variant websites and sends a new user to a random page
 * Persists session state using cookies
 * @param {Request} request
 */
async function handleRequest(request) {
  var requestUrls = new Request('https://cfw-takehome.developers.workers.dev/api/variants', {
    method: 'GET',
    headers: new Headers({
    'Content-Type': 'text/plain'
    })
  });

  // get the variant urls
  const urls = await fetch(requestUrls)
    .then((response) => {
      return response.json();
    }).then((response) => {
      return response.variants;
    }); 

  var variant;

  const cookie = request.headers.get('cookie');

  // check for a cookie from the user
  if (cookie && cookie.includes('variant')) {
    var cookies = cookie.split(';');
    // get the variant cookie
    cookies.forEach(cookie => {
      var cookieContents = cookie.split('=');

      if (cookieContents[0] === 'variant') {
        variant = cookieContents[1];
        console.log('variant found: ' + variant);
      }
    });
  } else {
    // the user has never visited this page before, so give them a new assignment
    if (Math.random() < 0.5) {
      variant = '1';
    } else {
      variant = '2';
    } 
  }

  // display the A/B version with modified content
  if (variant === '1') {
    const variantCookie = `variant=1; Expires=Wed, 7 Oct 2020 07:28:00 GMT; SameSite=None; Secure; Path=/`;

    return fetch(urls[0])
      .then((response) => {
        response = new Response(response.body, response);
        response.headers.set('Set-Cookie', variantCookie);

        return new HTMLRewriter().on('title', new TitleHandler())
          .on('a#url', new UrlElementHandler())
          .on('h1#title', new TitleHeader1Handler())
          .on('p#description', new Description1EltHandler())
          .transform(response);
      }).catch((error) => {
        console.log('there was an error');
      });

  } else {
    const variantCookie = `variant=2; Expires=Wed, 7 Oct 2020 07:28:00 GMT; SameSite=None; Secure; Path=/`;

    return fetch(urls[1])
      .then((response) => {
        response = new Response(response.body, response);
        response.headers.set('Set-Cookie', variantCookie);

        return new HTMLRewriter().on('title', new TitleHandler())
          .on('h1#title', new TitleHeader2Handler())
          .on('a#url', new UrlElementHandler())
          .on('p#description', new Description2EltHandler())
          .transform(response);

      }).catch((error) => {
        console.log('there was an error');
      });
    
  }
}

/**
 * Handles the discription elements for variant one
 */
class Description1EltHandler {
  element(element) {
    element.setInnerContent("Variant 1: Brought to you " +
      "by cloudflare workers!");
  }
}

/**
 * Handles the discription elements for variant two
 */
class Description2EltHandler {
  element(element) {
    element.setInnerContent("Variant 2: Brought to you " +
      "by cloudflare workers!");
  }
}

/**
 * Handles the url element for variant one
 */
class UrlElementHandler {
  element(element) {
    element.setAttribute('url', 'https://github.com/alexandrashaw10');
    element.setInnerContent('Check out my github!');
  }
}

/**
 * Handles the tab title element (same for both variations)
 */
class TitleHandler {
  element(element) {
    element.setInnerContent('Alex Shaw\'s Website');
  }
}

/**
 * Handles the title element displayed on the page for variant 1
 */
class TitleHeader1Handler {
  element(element) {
    element.setInnerContent('Alex Shaw\'s Variant 1');
  }
}

/**
 * Handles the title element displayed on the page for variant 2
 */
class TitleHeader2Handler {
  element(element) {
    element.setInnerContent('Alex Shaw\'s Variant 2');
  }
}
