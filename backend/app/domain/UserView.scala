package domain

import org.joda.time.DateTime

case class UserView(timestamp: DateTime,
                     appDomain: Int,
                     customerId: Option[Long],
                     sessionId: String,
                     action: String,
                     flowId: String,
                     searchTerm: Option[String],
                     recoResults: Option[Seq[String]]) {

}
