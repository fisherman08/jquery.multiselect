  # jQuery.MultiSelect.js

  セレクトボックスのoptionをベースに選択式のGUIを生成します。
  ### 必要なもの
  * BootStrap3
  * jQuery

  ### 使い方

  * jsとcssを読み込んでください
  * $("#select").MultiSelect(); オプションの詳細は下記。
  * MultiSelectを適用したいセレクトボックスには必ずmultiple属性を持たせてください。
  * optgroupにも一応対応している。optgroupに入っていないoptionが最初、その下にoptgroupごとに。

  ### オプション
     title: "",
     dict_select: "選択",
     dict_select_all: "全て選択",
     dict_cancel_all: "全て選択解除",
     class_front_div: "jquery_multi_select_modal_selected_tbl",
     class_modal_div: "jquery_multi_select_modal",
     class_selected: "bg-success" // モーダル上で選択済みのものに付与されるクラス名
  ### license
      Copyright (c) 2015 Y.Kaneko
      https://github.com/fisherman08
      This software is released under the MIT License.
      http://opensource.org/licenses/mit-license.php