var Promise = require("Promise");

/**
  * FetchModel - Fetch a model from the web server.
  *     url - string - The URL to issue the GET request.
  * Returns: a Promise that should be filled
  * with the response of the GET request parsed
  * as a JSON object and returned in the property
  * named "data" of an object.
  * If the requests has an error the promise should be
  * rejected with an object contain the properties:
  *    status:  The HTTP response status
  *    statusText:  The statusText from the xhr request
  *
*/


function fetchModel(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("GET", url, true);
    xhr.responseType = "json";

    xhr.onload = function onLoad() {
      if (xhr.status >= 200 && xhr.status < 300) {
        let responseData = xhr.response;

        if (responseData === null || typeof responseData === "undefined") {
          try {
            responseData = JSON.parse(xhr.responseText);
          } catch (error) {
            reject({
              status: xhr.status,
              statusText: "Invalid JSON response",
            });
            return;
          }
        }

        resolve({ data: responseData });
      } else {
        reject({
          status: xhr.status,
          statusText: xhr.statusText,
        });
      }
    };

    xhr.onerror = function onError() {
      reject({
        status: xhr.status || 0,
        statusText: xhr.statusText || "Network Error",
      });
    };

    xhr.send();
  });
}

export default fetchModel;
