import { Link } from "react-router-dom"

import "./App.css"

const Support = () => (
  <div className="Main">
    <Link to="/">← Go back</Link>
    <p>
      If you have questions or concerns about Dajsz you can reach out at
      <a href="mailto:support@dajsz.hu"> support@dajsz.hu</a>. If you found
      any bugs or issues you can report them
      <a href="https://github.com/akarasz/dajsz/issues"> here</a>.
    </p>
  </div>
)

export default Support