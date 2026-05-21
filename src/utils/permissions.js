export function isOwner(user, ownerId) {
  return Number(user?.id) === Number(ownerId);
}