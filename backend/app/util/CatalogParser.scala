package util

import domain.{UserView, CatalogView}
import org.joda.time.DateTime
import org.joda.time.format.DateTimeFormat

class CatalogParser {
  def loadTestFile:Seq[CatalogView] = {
    val source = scala.io.Source.fromFile("/home/nmahle/Downloads/documents-export-2015-12-15/realtimelogging_catalog_tracking.log.2015-12-14")
    val lines: Seq[String] = try source.getLines().toList finally source.close()
    lines.map(parseRow)
  }
  
  def parseRow(row: String):CatalogView = {
    val rowSplitted: Array[String] = row.split("\t")
    
    val timeStamp = rowSplitted(0)
    val appDomain = rowSplitted(1).toInt
    val customerId = rowSplitted(2) match {
      case "UNKNOWN_CUSTOMER" | "-" => None
      case x => Some(x.toLong)
    }
    val sessionId = rowSplitted(3)
    val jsonData = rowSplitted(4)
    val skuList = rowSplitted(5).split(',').toSeq
    val viewType = rowSplitted(6)
    val pageDetails = rowSplitted(7)
    val hashValue = rowSplitted(8)

    val formatter = DateTimeFormat.forPattern("yyyy-MM-dd HH:mm:ss,SSS")
    CatalogView(DateTime.parse(timeStamp, formatter),
                appDomain,
                customerId,
                sessionId,
                jsonData,
                skuList,
                viewType,
                pageDetails,
                hashValue)
  }
}
