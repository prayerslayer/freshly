package util

import domain.{UserView, CatalogView}
import org.joda.time.DateTime
import org.joda.time.format.DateTimeFormat
import play.api.Logger

class CatalogParser {
  def loadTestFile:Seq[CatalogView] = {
    Logger.info("Start Parsing Catalog File")
    val source = scala.io.Source.fromFile("/home/nmahle/tracking/realtimelogging_catalog_tracking.log.2015-12-10")
    val lines: Seq[String] = try source.getLines().toList finally source.close()
    lines.map(parseRow).flatten
  }
  
  def parseRow(row: String):Option[CatalogView] = {
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
    if(jsonData.contains("q=[") && appDomain == 1) {
      Some(CatalogView(DateTime.parse(timeStamp, formatter),
        appDomain,
        customerId,
        sessionId,
        jsonData,
        extractQuery(jsonData),
        skuList,
        viewType,
        pageDetails,
        hashValue))
    } else {
      None
    }
    }

  def extractQuery(data: String):String = {
    val startIndex = data.indexOf("q=[")
    val firstSplit = data.substring(startIndex)
    val endIndex = firstSplit.indexOf(']')
    firstSplit.substring(3,endIndex)
  }
}
