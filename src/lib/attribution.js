/**
 * Who wrote a card, as one line of text -- or nothing at all.
 *
 * Most decks have a single author, and there a "created by" line on every card
 * is noise on a screen whose whole job is recall. The line only earns its place
 * in a deck several people are building together through a share link, and even
 * there it says nothing about the cards you wrote yourself.
 *
 * The server decides whether a deck has more than one author, and resolves
 * accounts to names; this only decides what to say.
 *
 * @param {object} card         a card from /api/cards
 * @param {boolean} multiAuthor whether the deck has more than one author
 * @returns {string|null}       the line to show, or null to show nothing
 */
export function attributionLine(card, multiAuthor) {
  if (!card || !multiAuthor) return null;

  const parts = [];

  // Your own authorship is not news to you.
  if (card.created_by_name && !card.created_by_you) {
    parts.push(`Created by ${card.created_by_name}`);
  }

  // Only set when someone other than the author last changed the card. Worth
  // saying even when that someone is you: otherwise the line credits wording
  // to the original author that you are the one who rewrote.
  if (card.edited_by_name) {
    parts.push(card.edited_by_you ? "Edited by you" : `Edited by ${card.edited_by_name}`);
  }

  return parts.length ? parts.join(" · ") : null;
}
