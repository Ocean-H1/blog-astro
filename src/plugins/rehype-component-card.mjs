/// <reference types="mdast" />
import { h } from 'hastscript'

/**
 * Creates a card component.
 *
 * @param {Object} properties - The properties of the component.
 * @param {string} [properties.title] - An optional title for the card.
 * @param {import('mdast').RootContent[]} children - The children elements of the component.
 * @returns {import('mdast').Parent} The created card component.
 */
export function CardComponent(properties, children) {
  if (!Array.isArray(children) || children.length === 0) {
    return h(
      'div',
      { class: 'hidden' },
      'Invalid card directive. (Card directives must be of block type ":::card{title=\'Title\'} <content> :::")',
    )
  }

  const title = properties?.title ? properties.title : 'Untitled Card'

  return h('div', { class: 'card-component' }, [
    h('div', { class: 'card-header' }, title),
    h('div', { class: 'card-body' }, children),
  ])
}
