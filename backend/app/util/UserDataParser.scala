package util

import domain.UserAction
import org.joda.time.DateTime
import org.joda.time.format.{DateTimeFormat, DateTimeFormatter}

class   UserDataParser {
  
  def loadTestFile: Seq[UserAction] = {
    val source = scala.io.Source.fromFile("/home/nmahle/Downloads/documents-export-2015-12-15/realtimelogging_useraction_tracking.log.2015-12-14")
    val lines: Seq[String] = try source.getLines().toList finally source.close()
    lines.map(parseRow)
  }
  
  def getTestString: String =
    """2015-12-10 00:00:38,681	15	ZI111N03Z-Q11	-	73001265740	102902E0376220805ACB476F62751E50.jvm_itr-http66_p0120	VIEWRECO	-	-	-	cda045d9-9145-4b9f-8fb5-d4979fda1878	n.	-""".stripMargin.trim

  def parseRow(rowData: String):UserAction = {
    val rowDataSplitted: Array[String] = rowData.split("\t")
    
    val timeStamp = rowDataSplitted(0)
    val appDomnain = rowDataSplitted(1).toInt
    val configSku = rowDataSplitted(2)
    val simpleSku = rowDataSplitted(3) match {
      case "-" => None
      case x => Some(x)
    }
    val customerId = rowDataSplitted(4) match {
      case "UNKNOWN_CUSTOMER" => None
      case "-" => None
      case x => Some(x.toLong)
    }
    val sessionId = rowDataSplitted(5)
    val action = rowDataSplitted(6)
    val quantity = rowDataSplitted(7)  match {
      case "-" => None
      case x => Some(x.toInt)
    }
    val price = rowDataSplitted(8)  match {
      case "-" => None
      case x => Some(x.toInt)
    }
    val orderId = rowDataSplitted(9)  match {
      case "-" => None
      case x => Some(x.toLong)
    } 
    val flowId = rowDataSplitted(10)
    val referrerLink = rowDataSplitted(12)  match {
      case "-" => None
      case x => Some(x)
    }

    val formatter = DateTimeFormat.forPattern("yyyy-MM-dd HH:mm:ss,SSS")
    UserAction(DateTime.parse(timeStamp, formatter),
               appDomnain,
               configSku,
                simpleSku,
                customerId,
                sessionId,
                action,
                quantity,
                price,
                orderId,
                flowId,
                referrerLink)
  }
}
