package domain

import play.api.libs.json.{Json, Format}

object UserSearchArticle {
  implicit def jsonFormatter: Format[UserSearchArticle] = Json.format[UserSearchArticle]

  def fromDataInput(action: UserAction):UserSearchArticle=
    UserSearchArticle(action.configSku, action.simpleSku, action.action)
}

case class UserSearchArticle(configSku: String,
                              simpleSku: Option[String],
                              action: String) {

}
