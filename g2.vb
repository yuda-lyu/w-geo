
    'USCS
    If rCoarseContent > 50 Then


        If ctGRAVEL > ctSAND Then '規範沒定義等於情況，先將等於情況歸砂 (2017/09/04)


            If rFineContent < 5 Then


                ' ch_Judge(cmodname, dt, "Cu", 0, "", "<", lterr)
                ' ch_Judge(cmodname, dt, "Cc", 0, "", "<", lterr)
                ' If lterr.Count > 0 Then
                '     Cal_土壤分類_數據複寫(dt, "")
                '     Return lterr
                ' End If


                If getUSCS_WP_Cu4(Cu, Cc) Then
                    USCS = "GW"

                    If ctSAND < 15 Then

                        USCSDspEng = "Well-graded gravel"
                        USCSDspCht = "級配良好礫石"

                    Else 'ctSAND >= 15

                        USCSDspEng = "Well-graded gravel with sand"
                        USCSDspCht = "含砂之級配良好礫石"

                    End If

                Else
                    USCS = "GP"

                    If ctSAND < 15 Then

                        USCSDspEng = "Poorly graded gravel"
                        USCSDspCht = "級配不良礫石"

                    Else 'ctSAND >= 15

                        USCSDspEng = "Poorly graded gravel with sand"
                        USCSDspCht = "含砂之級配不良礫石"

                    End If

                End If


            ElseIf rFineContent > 12 Then


                ' ch_Nothing(cmodname, dt, "PI", lterr)
                ' ch_Nothing(cmodname, dt, "LL", lterr)
                ' If lterr.Count > 0 Then
                '     Cal_土壤分類_數據複寫(dt, "")
                '     Return lterr
                ' End If


                Dim MC3 As String = getUSCS_MC_AlinePI(PI, LL)
                If MC3 = "C" Then
                    USCS = "GC"

                    If ctSAND < 15 Then

                        USCSDspEng = "Clayey gravel"
                        USCSDspCht = "黏土質礫石"

                    Else 'ctSAND >= 15

                        USCSDspEng = "Clayey gravel with sand"
                        USCSDspCht = "含砂之黏土質礫石"

                    End If

                ElseIf MC3 = "M" Then
                    USCS = "GM"

                    If ctSAND < 15 Then

                        USCSDspEng = "Silty gravel"
                        USCSDspCht = "粉土質礫石"

                    Else 'ctSAND >= 15

                        USCSDspEng = "Silty gravel with sand"
                        USCSDspCht = "含砂之粉土質礫石"

                    End If

                ElseIf MC3 = "C-M" Then
                    USCS = "GC-GM"

                    If ctSAND < 15 Then

                        USCSDspEng = "Silty, clayey gravel"
                        USCSDspCht = "粉土質、黏土質礫石"

                    Else 'ctSAND >= 15

                        USCSDspEng = "Silty, clayey gravel with sand"
                        USCSDspCht = "含砂之粉土質、黏土質礫石"

                    End If

                End If


            Else '5 <= rFineContent And rFineContent <= 12


                ' ch_Judge(cmodname, dt, "Cu", 0, "", "<", lterr)
                ' ch_Judge(cmodname, dt, "Cc", 0, "", "<", lterr)
                ' If lterr.Count > 0 Then
                '     Cal_土壤分類_數據複寫(dt, "")
                '     Return lterr
                ' End If


                ' ch_Nothing(cmodname, dt, "PI", lterr)
                ' ch_Nothing(cmodname, dt, "LL", lterr)
                ' If lterr.Count > 0 Then
                '     Cal_土壤分類_數據複寫(dt, "")
                '     Return lterr
                ' End If


                If getUSCS_WP_Cu4(Cu, Cc) Then


                    Dim MC3 As String = getUSCS_MC_AlinePI(PI, LL)
                    If MC3 = "C" Or MC3 = "C-M" Then
                        USCS = "GW-GC"

                        If ctSAND < 15 Then

                            USCSDspEng = "Well-graded gravel with clay (or silty clay)"
                            USCSDspCht = "含黏土之級配良好礫石"

                        Else 'ctSAND >= 15

                            USCSDspEng = "Well-graded gravel with clay and sand (or silty clay and sand)"
                            USCSDspCht = "含黏土與砂之級配良好礫石"

                        End If

                    ElseIf MC3 = "M" Then
                        USCS = "GW-GM"

                        If ctSAND < 15 Then

                            USCSDspEng = "Well-graded gravel with silt"
                            USCSDspCht = "含粉土之級配良好礫石"

                        Else 'ctSAND >= 15

                            USCSDspEng = "Well-graded gravel with silt and sand"
                            USCSDspCht = "含粉土與砂之級配良好礫石"

                        End If

                    End If


                Else


                    Dim MC3 As String = getUSCS_MC_AlinePI(PI, LL)
                    If MC3 = "C" Or MC3 = "C-M" Then
                        USCS = "GP-GC"

                        If ctSAND < 15 Then

                            USCSDspEng = "Poorly graded gravel with clay (or silty clay)"
                            USCSDspCht = "含黏土之級配不良礫石"

                        Else 'ctSAND >= 15

                            USCSDspEng = "Poorly graded gravel with clay and sand (or silty clay and sand)"
                            USCSDspCht = "含黏土與砂之級配不良礫石"

                        End If

                    ElseIf MC3 = "M" Then
                        USCS = "GP-GM"

                        If ctSAND < 15 Then

                            USCSDspEng = "Poorly graded gravel with silt"
                            USCSDspCht = "含粉土之級配不良礫石"

                        Else 'ctSAND >= 15

                            USCSDspEng = "Poorly graded gravel with silt and sand"
                            USCSDspCht = "含粉土及砂之級配不良礫石"

                        End If

                    End If


                End If


            End If


        Else 'ctGRAVEL < ctSAND


            If rFineContent < 5 Then


                ' ch_Judge(cmodname, dt, "Cu", 0, "", "<", lterr)
                ' ch_Judge(cmodname, dt, "Cc", 0, "", "<", lterr)
                ' If lterr.Count > 0 Then
                '     Cal_土壤分類_數據複寫(dt, "")
                '     Return lterr
                ' End If


                If getUSCS_WP_Cu6(Cu, Cc) Then
                    USCS = "SW"

                    If ctGRAVEL < 15 Then

                        USCSDspEng = "Well-graded sand"
                        USCSDspCht = "級配良好砂"

                    Else 'ctGRAVEL >= 15

                        USCSDspEng = "Well-graded sand with gravel"
                        USCSDspCht = "含礫石之級配良好砂"

                    End If

                Else
                    USCS = "SP"

                    If ctGRAVEL < 15 Then

                        USCSDspEng = "Poorly graded sand"
                        USCSDspCht = "級配不良砂"

                    Else 'ctGRAVEL >= 15

                        USCSDspEng = "Poorly graded sand with gravel"
                        USCSDspCht = "含礫石之級配不良砂"

                    End If

                End If


            ElseIf rFineContent > 12 Then


                ' ch_Nothing(cmodname, dt, "PI", lterr)
                ' ch_Nothing(cmodname, dt, "LL", lterr)
                ' If lterr.Count > 0 Then
                '     Cal_土壤分類_數據複寫(dt, "")
                '     Return lterr
                ' End If


                Dim MC3 As String = getUSCS_MC_AlinePI(PI, LL)
                If MC3 = "C" Then
                    USCS = "SC"

                    If ctGRAVEL < 15 Then

                        USCSDspEng = "Clayey sand"
                        USCSDspCht = "黏土質砂"

                    Else 'ctGRAVEL >= 15

                        USCSDspEng = "Clayey sand with gravel"
                        USCSDspCht = "含礫石之黏土質砂"

                    End If

                ElseIf MC3 = "M" Then
                    USCS = "SM"

                    If ctGRAVEL < 15 Then

                        USCSDspEng = "Silty sand"
                        USCSDspCht = "粉土質砂"

                    Else 'ctGRAVEL >= 15

                        USCSDspEng = "Silty sand with gravel"
                        USCSDspCht = "含礫石之粉土質砂"

                    End If

                ElseIf MC3 = "C-M" Then
                    USCS = "SC-SM"

                    If ctGRAVEL < 15 Then

                        USCSDspEng = "Silty, clayey sand"
                        USCSDspCht = "粉土質、黏土質砂"

                    Else 'ctGRAVEL >= 15

                        USCSDspEng = "Silty,clayey sand with gravel"
                        USCSDspCht = "含礫石之粉土質、黏土質砂"

                    End If

                End If


            Else '5 <= rFineContent And rFineContent <= 12


                ' ch_Judge(cmodname, dt, "Cu", 0, "", "<", lterr)
                ' ch_Judge(cmodname, dt, "Cc", 0, "", "<", lterr)
                ' If lterr.Count > 0 Then
                '     Cal_土壤分類_數據複寫(dt, "")
                '     Return lterr
                ' End If


                ' ch_Nothing(cmodname, dt, "PI", lterr)
                ' ch_Nothing(cmodname, dt, "LL", lterr)
                ' If lterr.Count > 0 Then
                '     Cal_土壤分類_數據複寫(dt, "")
                '     Return lterr
                ' End If


                If getUSCS_WP_Cu6(Cu, Cc) Then


                    Dim MC3 As String = getUSCS_MC_AlinePI(PI, LL)
                    If MC3 = "C" Or MC3 = "C-M" Then
                        USCS = "SW-SC"

                        If ctGRAVEL < 15 Then

                            USCSDspEng = "Well-graded sand with clay (or silty clay)"
                            USCSDspCht = "含黏土之級配良好砂"

                        Else 'ctGRAVEL >= 15

                            USCSDspEng = "Well-graded sand with clay and gravel (or silty clay and gravel)"
                            USCSDspCht = "含黏土與礫石之級配良好砂"

                        End If

                    ElseIf MC3 = "M" Then
                        USCS = "SW-SM"

                        If ctGRAVEL < 15 Then

                            USCSDspEng = "Well-graded sand with silt"
                            USCSDspCht = "含粉土之級配良好砂"

                        Else 'ctGRAVEL >= 15

                            USCSDspEng = "Well-graded sand with silt and gravel"
                            USCSDspCht = "含粉土與礫石之級配良好砂"

                        End If

                    End If


                Else


                    Dim MC3 As String = getUSCS_MC_AlinePI(PI, LL)
                    If MC3 = "C" Or MC3 = "C-M" Then
                        USCS = "SP-SC"

                        If ctGRAVEL < 15 Then

                            USCSDspEng = "Poorly graded sand with clay (or silty clay)"
                            USCSDspCht = "含黏土之級配不良砂"

                        Else 'ctGRAVEL >= 15

                            USCSDspEng = "Poorly graded sand with clay and gravel (or silty clay and gravel)"
                            USCSDspCht = "含黏土與礫石之級配不良砂"

                        End If

                    ElseIf MC3 = "M" Then
                        USCS = "SP-SM"

                        If ctGRAVEL < 15 Then

                            USCSDspEng = "Poorly graded sand with silt"
                            USCSDspCht = "含粉土之級配不良砂"

                        Else 'ctGRAVEL >= 15

                            USCSDspEng = "Poorly graded sand with silt and gravel"
                            USCSDspCht = "含粉土與礫石之級配不良砂"

                        End If

                    End If


                End If


            End If


        End If


    Else 'rCoarseContent <= 50


        ' ch_Nothing(cmodname, dt, "LL", lterr)
        ' If lterr.Count > 0 Then
        '     Cal_土壤分類_數據複寫(dt, "")
        '     Return lterr
        ' End If


        If Not IsNumeric(LL) Then


            '目前試驗室尚未有機土壤試驗，以及會有試驗者人工判斷不須做阿太堡狀況，會有無LL (2016/11/16)
            '若阿太堡結果LL為非數字，則土壤分類強制給「ML」 (2018/12/10)
            USCS = "ML"


            If rCoarseContent < 30 Then

                If rCoarseContent < 15 Then

                    USCSDspEng = "Silt"
                    USCSDspCht = "粉土"

                Else '15 <= rCoarseContent < 30

                    If ctSAND >= ctGRAVEL Then

                        USCSDspEng = "Silt with sand"
                        USCSDspCht = "含砂之粉土"

                    Else 'ctSAND < ctGRAVEL

                        USCSDspEng = "Silt with gravel"
                        USCSDspCht = "含礫石之粉土"

                    End If

                End If

            Else 'rCoarseContent >= 30

                If ctSAND >= ctGRAVEL Then

                    If ctGRAVEL < 15 Then

                        USCSDspEng = "Sandy silt"
                        USCSDspCht = "砂質粉土"

                    Else 'ctGRAVEL >= 15

                        USCSDspEng = "Sandy silt with gravel"
                        USCSDspCht = "含礫石之砂質粉土"

                    End If

                Else 'ctSAND < ctGRAVEL

                    If ctGRAVEL < 15 Then

                        USCSDspEng = "Gravelly silt"
                        USCSDspCht = "礫石質粉土"

                    Else 'ctGRAVEL >= 15

                        USCSDspEng = "Gravelly silt with sand"
                        USCSDspCht = "含砂之礫石質粉土"

                    End If

                End If

            End If


        Else


            'ch_Nothing(cmodname, dt, "Organic", lterr)
            'ch_NotInValues(cmodname, dt, "Organic", {0, 1}, lterr)
            'If lterr.Count > 0 Then
            '    Cal_土壤分類_數據複寫(dt, "")
            '    Return lterr
            'End If
            Organic = 0 '強迫設定為無機 (2017/06/13)


            If LL >= 50 Then


                If Organic = 0 Then
                    '無機


                    ' ch_Nothing(cmodname, dt, "PI", lterr)
                    ' If lterr.Count > 0 Then
                    '     Cal_土壤分類_數據複寫(dt, "")
                    '     Return lterr
                    ' End If


                    Dim MC2 As String = getUSCS_MC_Aline(PI, LL)
                    If MC2 = "C" Then
                        USCS = "CH"

                        If rCoarseContent < 30 Then

                            If rCoarseContent < 15 Then

                                USCSDspEng = "Fat clay"
                                USCSDspCht = "高塑性黏土"

                            Else '15 <= rCoarseContent < 30

                                If ctSAND >= ctGRAVEL Then

                                    USCSDspEng = "Fat clay with sand"
                                    USCSDspCht = "含砂之高塑性黏土"

                                Else 'ctSAND < ctGRAVEL

                                    USCSDspEng = "Fat clay with gravel"
                                    USCSDspCht = "含礫石之高塑性黏土"

                                End If

                            End If

                        Else 'rCoarseContent >= 30

                            If ctSAND >= ctGRAVEL Then

                                If ctGRAVEL < 15 Then

                                    USCSDspEng = "Sandy fat clay"
                                    USCSDspCht = "砂質高塑性黏土"

                                Else 'ctGRAVEL >= 15

                                    USCSDspEng = "Sandy fat clay with gravel"
                                    USCSDspCht = "含礫石之砂質高塑性黏土"

                                End If

                            Else 'ctSAND < ctGRAVEL

                                If ctGRAVEL < 15 Then

                                    USCSDspEng = "Gravelly fat clay"
                                    USCSDspCht = "礫石質高塑性黏土"

                                Else 'ctGRAVEL >= 15

                                    USCSDspEng = "Gravelly fat clay with sand"
                                    USCSDspCht = "含砂之礫石質高塑性黏土"

                                End If

                            End If

                        End If

                    ElseIf MC2 = "M" Then
                        USCS = "MH"

                        If rCoarseContent < 30 Then


                            If rCoarseContent < 15 Then

                                USCSDspEng = "Elastic silt"
                                USCSDspCht = "彈性粉土"

                            Else '15 <= rCoarseContent < 30

                                If ctSAND >= ctGRAVEL Then

                                    USCSDspEng = "Elastic silt with sand"
                                    USCSDspCht = "含砂之彈性粉土"

                                Else 'ctSAND < ctGRAVEL

                                    USCSDspEng = "Elastic silt with gravel"
                                    USCSDspCht = "含礫石之彈性粉土"

                                End If

                            End If

                        Else 'rCoarseContent >= 30

                            If ctSAND >= ctGRAVEL Then

                                If ctGRAVEL < 15 Then

                                    USCSDspEng = "Sandy Elastic silt"
                                    USCSDspCht = "砂質彈性粉土"

                                Else 'ctGRAVEL >= 15

                                    USCSDspEng = "Sandy Elastic silt with gravel"
                                    USCSDspCht = "含礫石之砂質彈性粉土"

                                End If

                            Else 'ctSAND < ctGRAVEL

                                If ctGRAVEL < 15 Then

                                    USCSDspEng = "Gravelly Elastic silt"
                                    USCSDspCht = "礫石質彈性粉土"

                                Else 'ctGRAVEL >= 15

                                    USCSDspEng = "Gravelly Elastic silt with sand"
                                    USCSDspCht = "含砂之礫石質彈性粉土"

                                End If

                            End If

                        End If

                    End If


                ElseIf Organic = 1 Then
                    '有機


                    ' ch_Judge(cmodname, dt, "LLdry", 0, "", "<", lterr)
                    ' If lterr.Count > 0 Then
                    '     Cal_土壤分類_數據複寫(dt, "")
                    '     Return lterr
                    ' End If


                    If LLdry / LL < 0.75 Then

                        USCS = "OH" '有機Organic Silt, Organic Clay
                        USCSDspEng = "-"
                        USCSDspCht = "-"

                    Else 'LLdry / LL >= 0.75

                        USCS = "PT(待確認)" '泥炭Peat
                        USCSDspEng = "-"
                        USCSDspCht = "-"

                    End If


                End If


            Else 'LL < 50
                '阿太堡 U線 = 0.9(LL-8)
                'U線約為我們目前所知土壤「塑性指數PI」與「液性限度LL」間關係之上限
                '由此可知 LL 最小值為 8


                If Organic = 0 Then
                    '無機


                    ' ch_Nothing(cmodname, dt, "PI", lterr)
                    ' If lterr.Count > 0 Then
                    '     Cal_土壤分類_數據複寫(dt, "")
                    '     Return lterr
                    ' End If


                    Dim MC3 As String = getUSCS_MC_AlinePI(PI, LL)
                    If MC3 = "C" Then
                        USCS = "CL"

                        If rCoarseContent < 30 Then

                            If rCoarseContent < 15 Then

                                USCSDspEng = "Lean clay"
                                USCSDspCht = "低塑性黏土"

                            Else '15 <= rCoarseContent < 30

                                If ctSAND >= ctGRAVEL Then

                                    USCSDspEng = "Lean clay with sand"
                                    USCSDspCht = "含砂之低塑性黏土"

                                Else 'ctSAND < ctGRAVEL

                                    USCSDspEng = "Lean clay with gravel"
                                    USCSDspCht = "含礫石之低塑性黏土"

                                End If

                            End If

                        Else 'rCoarseContent >= 30

                            If ctSAND >= ctGRAVEL Then

                                If ctGRAVEL < 15 Then

                                    USCSDspEng = "Sandy lean clay"
                                    USCSDspCht = "砂質低塑性黏土"

                                Else 'ctGRAVEL >= 15

                                    USCSDspEng = "Sandy lean clay with gravel"
                                    USCSDspCht = "含礫石之砂質低塑性黏土"

                                End If

                            Else 'ctSAND < ctGRAVEL

                                If ctGRAVEL < 15 Then

                                    USCSDspEng = "Gravelly lean clay"
                                    USCSDspCht = "礫石質低塑性黏土"

                                Else 'ctGRAVEL >= 15

                                    USCSDspEng = "Gravelly lean clay with sand"
                                    USCSDspCht = "含砂之礫石質低塑性黏土"

                                End If

                            End If

                        End If

                    ElseIf MC3 = "M" Then
                        USCS = "ML"

                        If rCoarseContent < 30 Then

                            If rCoarseContent < 15 Then

                                USCSDspEng = "Silt"
                                USCSDspCht = "粉土"

                            Else '15 <= rCoarseContent < 30

                                If ctSAND >= ctGRAVEL Then

                                    USCSDspEng = "Silt with sand"
                                    USCSDspCht = "含砂之粉土"

                                Else 'ctSAND < ctGRAVEL

                                    USCSDspEng = "Silt with gravel"
                                    USCSDspCht = "含礫石之粉土"

                                End If

                            End If

                        Else 'rCoarseContent >= 30

                            If ctSAND >= ctGRAVEL Then

                                If ctGRAVEL < 15 Then

                                    USCSDspEng = "Sandy silt"
                                    USCSDspCht = "砂質粉土"

                                Else 'ctGRAVEL >= 15

                                    USCSDspEng = "Sandy silt with gravel"
                                    USCSDspCht = "含礫石之砂質粉土"

                                End If

                            Else 'ctSAND < ctGRAVEL

                                If ctGRAVEL < 15 Then

                                    USCSDspEng = "Gravelly silt"
                                    USCSDspCht = "礫石質粉土"

                                Else 'ctGRAVEL >= 15

                                    USCSDspEng = "Gravelly silt with sand"
                                    USCSDspCht = "含砂之礫石質粉土"

                                End If

                            End If

                        End If

                    ElseIf MC3 = "C-M" Then
                        USCS = "CL-ML"

                        If rCoarseContent < 30 Then

                            If rCoarseContent < 15 Then

                                USCSDspEng = "Silty clay"
                                USCSDspCht = "粉土質黏土"

                            Else '15 <= rCoarseContent < 30

                                If ctSAND >= ctGRAVEL Then

                                    USCSDspEng = "Silty clay with sand"
                                    USCSDspCht = "含砂之粉土質黏土"

                                Else 'ctSAND < ctGRAVEL

                                    USCSDspEng = "Silty clay with gravel"
                                    USCSDspCht = "含礫石之粉土質黏土"

                                End If

                            End If

                        Else 'rCoarseContent >= 30

                            If ctSAND >= ctGRAVEL Then

                                If ctGRAVEL < 15 Then

                                    USCSDspEng = "Sandy Silty clay"
                                    USCSDspCht = "砂質粉土質黏土"

                                Else 'ctGRAVEL >= 15

                                    USCSDspEng = "Sandy Silty clay with gravel"
                                    USCSDspCht = "含礫石之砂質粉土質黏土"

                                End If

                            Else 'ctSAND < ctGRAVEL

                                If ctGRAVEL < 15 Then

                                    USCSDspEng = "Gravelly Silty clay"
                                    USCSDspCht = "礫石質粉土質黏土"

                                Else 'ctGRAVEL >= 15

                                    USCSDspEng = "Gravelly Silty clay with sand"
                                    USCSDspCht = "含砂之礫石質粉土質黏土"

                                End If

                            End If

                        End If

                    End If


                ElseIf Organic = 1 Then
                    '有機


                    ' ch_Judge(cmodname, dt, "LLdry", 0, "", "<", lterr)
                    ' If lterr.Count > 0 Then
                    '     Cal_土壤分類_數據複寫(dt, "")
                    '     Return lterr
                    ' End If


                    If LLdry / LL < 0.75 Then

                        USCS = "OL" '有機Organic Silt, Organic Clay
                        USCSDspEng = "-"
                        USCSDspCht = "-"

                    Else 'LLdry / LL >= 0.75

                        USCS = "PT(待確認)" '泥炭Peat
                        USCSDspEng = "-"
                        USCSDspCht = "-"

                    End If


                End If


            End If


        End If


    End If
