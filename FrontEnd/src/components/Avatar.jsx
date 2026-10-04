export default function Avatar({ user, size = 26, className = "", style = {}, ...rest }) {
  if (!user) return null;
  const dim = { width: size, height: size, fontSize: Math.round(size * 0.42) };

  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        className={"avatar avatar--img " + className}
        style={{ ...dim, ...style, borderRadius: "50%", objectFit: "cover" }}
        {...rest}
      />
    );
  }

  return (
    <span
      className={"avatar " + className}
      style={{
        ...dim,
        ...style,
        background: user.color,
        borderRadius: "50%",
        color: "#fff",
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
      {...rest}
    >
      {user.name?.[0] || "?"}
    </span>
  );
}
