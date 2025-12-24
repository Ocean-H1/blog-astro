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
      'Invalid card directive. (Card directives must be of block type ":::card[xxx] <content> :::")',
    )
  }

  let label = 'Untitled Card'
  let content = children
  if (properties?.['has-directive-label']) {
    label = children[0] // The first child is the label
    content = children.slice(1)
    label.tagName = 'div' // Change the tag <p> to <div>
  }

  return h('div', { class: 'card-component' }, [
    h('div', { class: 'card-header' }, label),
    h('div', { class: 'card-body' }, content),
  ])
}
