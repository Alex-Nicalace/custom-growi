export default class HeaderWithEditLinkConfigurer {

  constructor(crowi) {
    this.crowi = crowi;
    console.log('crowi')
    console.log(crowi)
  }

  configure(md) {
    md.renderer.rules.heading_close = (tokens, idx) => {
      console.log('hi AWER8888888888888888888888888888888888888888888888');
      console.log(this.crowi.isAdmin);
      return this.crowi.isAdmin
        ? `<span class="revision-head-edit-button">
                <a href="#edit" onClick="Crowi.setCaretLineData(parseInt(this.parentNode.parentNode.dataset.line, 10))">
                  <i class="icon-note"></i>
                </a>
              </span></${tokens[idx].tag}>`
        : '';
    };
  }

}
