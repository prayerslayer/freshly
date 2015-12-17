package domain

import play.api.libs.json.Json

object SearchTermCount {
  implicit def formatJson = Json.format[SearchTermCount]
  
  def fromTuple(input:(String, Int)):SearchTermCount = SearchTermCount(input._1, input._2)
}

case class SearchTermCount(searchTerm: String, count: Int)