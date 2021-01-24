import { Link } from "react-router-dom"

const Privacy = () => (
  <div className="home">
    <Link to="/">← Go back</Link>
    <p>
      Dajsz and it's integrations are not storing any personal information, there
      is no permanent storage behind the service - all data created gets removed
      after 48 hours at the latest. You can check it for yourself - all code
      is available for the public:
    </p>

    <ul>
      <li><a href="https://github.com/akarasz/dajsz">Dajsz</a></li>
      <li><a href="https://github.com/akarasz/dajsz-slack">Slack integration</a></li>
      <li><a href="https://github.com/akarasz/yahtzee">Backend</a></li>
    </ul>

    <p>
      Dajsz uses Google Analytics for usage metrics. If you want to learn
      more about Google's privacy policy then you should head over
      <a href="https://support.google.com/analytics/answer/6004245"> there</a>.
    </p>
  </div>
)

export default Privacy