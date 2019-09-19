Sub pdfAnalyze()

    Dim dateiname, seite, auftrag, firma, name, datum, kategorie, text, stunden As String
    dateiname = "Dateiname"
    seite = "Seite"
    auftrag = "Auftrag"
    firma = "Firma"
    name = "Name"
    datum = "Datum"
    kategorie = "Kategorie"
    text = "Text"
    stunden = "Stunden"
    
    ActiveSheet.name = "Stundenrapporte"
    
    ' Kopfzeile einfügen und Beschriften
    Rows("1:1").Insert Shift:=xlDown, CopyOrigin:=xlFormatFromLeftOrAbove
    Range("A1").FormulaR1C1 = dateiname
    Range("B1").FormulaR1C1 = seite
    Range("C1").FormulaR1C1 = auftrag
    Range("D1").FormulaR1C1 = firma
    Range("E1").FormulaR1C1 = name
    Range("F1").FormulaR1C1 = datum
    Range("G1").FormulaR1C1 = kategorie
    Range("H1").FormulaR1C1 = text
    Range("I1").FormulaR1C1 = stunden
    

    'Get Last Cell in a series of data
    Dim lastCell As Range
    Set lastCell = Range("A1").End(xlToRight).End(xlDown)

    Dim dataTableRange As Range
    Dim dataTable As ListObject
    Set dataTableRange = ActiveSheet.Range("$A$1:$I$" & lastCell.Row)
    Set dataTable = ActiveSheet.ListObjects.Add(xlSrcRange, dataTableRange, , xlYes, , "TableStyleMedium15")
        
    ' Add new sheet with pivot
    Dim newSheet As Worksheet
    Set newSheet = Sheets.Add
    newSheet.name = "Kat.,Name,Datum"
    Dim pivotCache As pivotCache
    Dim pivotTable As pivotTable
    Set pivotCache = ActiveWorkbook.PivotCaches.Create(xlDatabase, dataTable)
    pivotCache.RefreshOnFileOpen = True
    Set pivotTable = pivotCache.CreatePivotTable(newSheet.Cells(1, 1))
    

    pivotTable.PivotFields(datum).Orientation = xlRowField
    
    pivotTable.AddDataField pivotTable.PivotFields(stunden), "Summe Stunden", xlSum
    
    ' Bar
    Dim barsRange As Range
    Dim dataBar As dataBar
    Set lastCell = newSheet.Range("A1").End(xlToRight).End(xlDown)
    Set barsRange = newSheet.Range("B2:B" & (lastCell.Row - 1))
    Set dataBar = barsRange.FormatConditions.AddDatabar
    dataBar.BarBorder.Type = xlDataBarBorderSolid
   
    pivotTable.PivotFields(name).Orientation = xlRowField
    pivotTable.PivotFields(name).Position = 1
    
    
    pivotTable.PivotFields(kategorie).Orientation = xlRowField
    pivotTable.PivotFields(kategorie).Position = 1
    
    pivotTable.SaveData = False
    
    newSheet.Cells(1, 1).Select
End Sub


