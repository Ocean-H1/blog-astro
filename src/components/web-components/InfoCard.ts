import { loadImage } from '@utils/file-utils'

const template = document.createElement('template')
template.innerHTML = /*html*/ `
<style>
.info-card {
  -webkit-transition: .3s;
  transition: .3s;
  border-radius: 12px;
  transition-timing-function: ease-in-out;
  position: relative;
  border: #e3e8f7;
  background-color: #fff;
  box-shadow: 0 8px 16px -4px rgba(44, 45, 48, 0.047);
  height: 90px;
  display: flex;
  line-height: 17px;
  transform: translateZ(0);
  cursor: pointer;
  overflow: hidden;
}

.info-card:hover {
  transform: scale(1);
  background-color: #425aef;
  box-shadow: 0 8px 12px -3px #425aef23;
}

.info-card:hover .link .avatar {
  -webkit-transition: .6s;
  transition: .6s;
  width: 0;
  height: 0;
  opacity: 0;
  -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=0)";
  filter: alpha(opacity=0);
  margin: .5rem;
  min-width: 0;
  min-height: 0;
}

.info-card:hover .info {
  color: #fff;
  min-width: calc(100% - 20px);
}

.info-card:hover .tag {
  left: -70px;
}

.info-card .tag {
  position: absolute;
  top: 0;
  left: 0;
  padding: 4px 8px;
  background-color: #425aef;
  -webkit-box-shadow: 0 8px 12px -3px rgba(40, 109, 234, 0.2);
  box-shadow: 0 8px 12px -3px rgba(40, 109, 234, 0.2);
  color: #fff;
  z-index: 1;
  border-radius: 11px 0 12px 0;
  -webkit-transition: .6s;
  -moz-transition: .6s;
  -o-transition: .6s;
  -ms-transition: .6s;
  transition: .6s;
  font-size: 12px;
}

.info-card>.link {
  width: 100%;
  height: 100%;
  display: flex;
  border: none;
  align-items: center;
  padding: 0 4px;
  font-weight: 700;
  text-decoration: none;
  color: #363636;
  flex-direction: row;
  justify-content: space-around;
}

.info-card .link .info {
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-pack: center;
  flex-direction: column;
  width: calc(100% - 90px);
  height: fit-content;
  justify-content: center;
}

.info-card .link .info .name {
  font-size: 19px;
  line-height: 20px;
  display: block;
  padding: 0 10px 0 0;
  max-width: calc(100% - 12px);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.info-card>.link .info .desc {
  height: 40px;
  line-height: 20px;
  display: -webkit-box;
  font-size: .9em;
  opacity: .7;
  white-space: normal;
  text-overflow: ellipsis;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.info-card .link .avatar {
  width: 60px;
  height: 60px;
  min-width: 60px;
  min-height: 60px;
  object-fit: cover;
  border-radius: 50%;
  margin: 15px 20px 15px 15px;
  transition: .6s;
  -webkit-transition: .6s;
}
</style>

<div class="info-card">
  <span class="tag"></span>
  <a class="link" target="_blank">
    <img class="avatar" onerror="this.onerror=null,this.src="./404.jpg"">
    <div class="info">
      <div class="name"></div>
      <div class="desc"></div>
    </div>
  </a>
</div>
`

class InfoCard extends HTMLElement {
  private _shadowRoot: ShadowRoot
  private tag: string | null = null
  private link = ''
  private avatar = ''
  private name = ''
  private desc = ''
  constructor() {
    super()

    this._shadowRoot = this.attachShadow({ mode: 'closed' })
    const content = template.content.cloneNode(true)

    this._shadowRoot.appendChild(content)
  }

  static get observedAttributes() {
    return ['tag', 'link', 'avatar', 'name', 'desc']
  }

  attributeChangedCallback(
    name: 'tag' | 'link' | 'avatar' | 'name' | 'desc',
    oldVal: string | null,
    newVal: string | null,
  ) {
    if (newVal !== null) {
      this[name] = newVal
    }
    this.render()
  }

  connectedCallback() {
    this.render()
  }

  async render() {
    const tagElement = this._shadowRoot.querySelector('.tag') as HTMLSpanElement
    const linkElement = this._shadowRoot.querySelector(
      '.link',
    ) as HTMLAnchorElement
    const avatarElement = this._shadowRoot.querySelector(
      '.avatar',
    ) as HTMLImageElement
    const nameElement = this._shadowRoot.querySelector(
      '.name',
    ) as HTMLDivElement
    const descElement = this._shadowRoot.querySelector(
      '.desc',
    ) as HTMLDivElement

    if (tagElement) {
      if (this.tag === null) {
        tagElement.style.display = 'none'
      }
      tagElement.textContent = this.tag
    }
    if (linkElement) {
      linkElement.href = this.link
      linkElement.title = this.name
    }
    if (avatarElement) {
      avatarElement.src = await loadImage(this.avatar, {
        defaultImageUrl: '/404.gif',
      })
      avatarElement.setAttribute('alt', this.name)
    }
    if (nameElement) {
      nameElement.textContent = this.name
    }
    if (descElement) {
      descElement.textContent = this.desc
    }
  }
}

customElements.define('info-card', InfoCard)
