export const serializeUser = (user) => ({
  id: user._id.toString(),
  userId: user.userId,
  fullName: user.fullName,
  email: user.email,
  isAccountVerified: user.isAccountVerified,
  passwordChangedAt: user.passwordChangedAt,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
