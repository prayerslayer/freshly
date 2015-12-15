package domain

import play.api.libs.json.{JsValue, Json}

case class Category (name: String, key: String, gender: String, parentKey: Option[String], childKeys: Option[List[String]], var children: List[Category] = List()){
  def toJson :JsValue = Json.toJson(
    Map(
      "name" -> Json.toJson(name),
      "key" -> Json.toJson(key),
      "gender" -> Json.toJson(gender),
      "parentKey" -> Json.toJson(parentKey.getOrElse("")),
      "childKeys" -> Json.toJson(childKeys.getOrElse(List())),
      "children" -> Json.toJson(children.map(child => child.toJson))
    ) 
  )
}
