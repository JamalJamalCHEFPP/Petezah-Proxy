let destination = "";

try {
  destination = new URL(location.hash.slice(1));

  if (!destination.protocol) {
    destination = new URL("https://" + destination.href);
  }
} catch (err) {
  alert(`Bad # string or bad URL. Got error:\n${err}`);
  alert(destination);
  console.log(location.hash);
  throw err;
}

registerSW()
  .then(() => {
    console.log(__uv$config.encodeUrl(destination.toString()));
    console.log(__uv$config.prefix + destination.toString());
    window.open(
      __uv$config.prefix + __uv$config.encodeUrl(destination),
      "_self"
    );
  })
  .catch((err) => {
    alert(`Encountered error:\n${err}`);
  });
