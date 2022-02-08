declare global {
  interface Document {
    documentMode?: any;
  }
}

class UnsupportedBrowserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export function oldBrowserError() {
  // Internet Explorer 6-11
  const ie = /* @cc_on!@ */ false || !!document.documentMode;
  if (ie) {
    [].slice
      .call(document.getElementsByClassName("container-fluid"))
      .forEach(function (errorDiv: HTMLElement) {
        errorDiv.innerHTML = `<section class="alert alert-danger"><h4>Outdated Browser</h4>
        Your web browser is unsupported. Please open the application on a modern web browser.
      </section>`;
      });
    throw new UnsupportedBrowserError("old browser!");
  }
  return ie;
}
