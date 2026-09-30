/**
 * Requests to the active GM over the system socket (spec 008, research R1).
 * Kept free of imports so any service can use it without pulling in others.
 */

const localize = (key) => game.i18n.localize(key);

/** The active GM, who performs requests on actors the player does not own. */
const activeGm = () => game.users.activeGM;

/**
 * Ask the active GM to do something (research R1).
 * @param {string} action
 * @param {object} payload
 */
export function requestGm(action, payload) {
  if (!activeGm()) {
    ui.notifications.warn(localize("DTD.Combat.NoGM"));
    return;
  }
  game.socket.emit("system.dtd40k", { action, payload, user: game.user.id });
  ui.notifications.info(localize("DTD.Combat.SentToGM"));
}
