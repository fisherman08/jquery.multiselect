/*

    jQuery.MultiSelect.js

  # セレクトボックスのoptionをベースに選択式のGUIを生成します。
  ## 必要なもの
  * BootStrap3
  * jQuery

  ## 使い方
  * jsとcssを読み込んでください
  * $("#select").MultiSelect({option}); オプションの詳細は下記。
  * MultiSelectを適用したいセレクトボックスには必ずmultiple属性を持たせてください。
  * optgroupにも一応対応している。optgroupに入っていないoptionが最初、その下にoptgroupごとに。

  ## オプション
     title: "",
     dict_select: "選択",
     dict_select_all: "全て選択",
     dict_cancel_all: "全て選択解除",
     class_front_div: "jquery_multi_select_modal_selected_tbl",
     class_modal_div: "jquery_multi_select_modal",
     class_selected: "bg-success" // モーダル上で選択済みのものに付与されるクラス名

 Copyright (c) 2015 Y.Kaneko
 https://github.com/fisherman08
 This software is released under the MIT License.
 http://opensource.org/licenses/mit-license.php

*/

(function($){
    jQuery.fn.MultiSelect = function(settings_in){
        return this.each(function(){
            new MultiSelect(jQuery(this), settings_in);
        });
    };

    var MultiSelect = function(elem_in, settings_in){
        var self = this;

        self.$element = $(elem_in);

        self.$div   = $("<div/>");
        self.$modal = $("<div/>");

        self.settings = $.extend(true,{
            title: "",
            dict_select: "選択",
            dict_select_all: "全て選択",
            dict_cancel_all: "全て選択解除",
            class_front_div: "jquery_multi_select_modal_selected_tbl",
            class_modal_div: "jquery_multi_select_modal",
            class_selected: "bg-success" // モーダル上で選択済みのものに付与されるクラス名
        }, settings_in);

        self.$optgroups = [];
        self.$options   = [];

        self.init();

        return self;
    };

    MultiSelect.prototype ={
        init: function(){
            var self = this;

            var tagname = self.$element.prop("tagName");
            // selectじゃなかったら何もしない
            if(tagname != "SELECT"){
                return;
            }

            // multipleじゃなかったらないもしない
            if(!self.$element.attr("multiple")){
                return;
            }

            // 要素を隠す
            self.hide_element();

            // 全て選択と全て解除を追加

            // option本体を追加していく
            self.add_options();

            // htmlを構築
            self.build_html();
        },
        /**
         * もともとのselectをhiddenにする
         */
        hide_element: function(){
            var self = this;
            self.$element.change(function(){
                self.when_original_html_changed();
            });
            self.$element.hide();
        },
        /**
         * optgroupとoptionを追加していく
         */
        add_options: function(){
            var self = this, $elements = self.$element.children();

            $elements.each(function(){
                var $elem = $(this);

                if($elem.prop("tagName") == "OPTGROUP" ){
                    // グループの場合
                    var optg = new OptGroup(self, $elem);
                    self.$optgroups.push(optg);
                }else{
                    // 単体のoption
                    var opt = new Option(self, $elem);
                    self.$options.push(opt);
                }

            });
        },
        /**
         * 選択済みテーブルと選択用のモーダルを作っていく
         */
        build_html: function(){
            var self = this;
            self.__build_html_front();
            self.__build_html_modal();
        },
        /**
         * 選択済みテーブルを作る
         * @private
         */
        __build_html_front: function(){
            var self = this, $div = $("<div/>").addClass(self.settings["class_front_div"]);

            // 選択開始ボタン
            $div.append(
                $("<p/>").append(
                    $("<a/>").attr({"href":"javascript:void(0)"}).text(self.settings["dict_select"]).click(function(e){
                        self.__call_modal();
                    })
                )
            );

            // options
            var $p = $("<p/>");
            for(var i= 0,li=self.$options.length; i< li; i++){
                var $option = self.$options[i];
                $p.append($option.get_$html());
            }
            $div.append($p);

            // optgroups
            for(var i= 0,li=self.$optgroups.length; i< li; i++){
                var $optgroup = self.$optgroups[i];
                $div.append($optgroup.get_$html());
            }

            self.$div = $div;
            self.$element.after(self.$div);
        },
        /**
         * モーダルウインドウを作る
         * @private
         */
        __build_html_modal: function(){
            var self = this, $modal = $("<div/>").addClass(self.settings["class_modal_div"]);

            // 一括選択、解除
            var $p = $("<p/>").addClass("text-center").append(
                $("<a/>").attr({"href":"javascript:void(0)"}).css({"margin-right":"5px"}).text(self.settings["dict_select_all"]).click(function(e){
                    self.__toggle_select_all(true);
                })
            ).append(
                $("<a/>").attr({"href":"javascript:void(0)"}).text(self.settings["dict_cancel_all"]).click(function(e){
                    self.__toggle_select_all(false);
                })
            );
            $modal.append($p);


            // 選択肢本体
            var $p = $("<p/>");
            for(var i= 0,li=self.$options.length; i< li; i++){
                var $option = self.$options[i];
                $p.append($option.get_$html_modal());
            }
            $modal.append($p);

            // optgroups
            for(var i= 0,li=self.$optgroups.length; i< li; i++){
                var $optgroup = self.$optgroups[i];
                $modal.append($optgroup.get_$html_modal());
            }

            self.$modal = $("<div/>").addClass("modal").append(
                $("<div/>").addClass("modal-dialog modal-dialog-edit").append(
                    $("<div/>").addClass("modal-content").append(
                        self.__build_modal_header()
                    ).append(
                        $("<div/>").addClass("modal-body").append(
                            $modal
                        )
                    )
                )
            );
        },
        __build_modal_header: function(){
            var self = this, $header = $("<div/>").addClass("modal-header");

            if(self.settings["title"]){
                // タイトル
                $header.text(self.settings["title"]);
            }

            return $header;
        },
        __call_modal: function(){
            var self = this;
            self.$modal.modal("show");
        },
        __toggle_select_all: function(is_selected){
            var self = this;
            $.each(self.$options, function(index, opt){
                opt.set_selected(is_selected);
            });

            $.each(self.$optgroups, function(index, optg){
                optg.set_selected(is_selected);
            });
        },
        when_original_html_changed: function(){
            var self = this;
            $.each(self.$options, function(index, opt){
                opt.when_original_html_changed();
            });

            $.each(self.$optgroups, function(index, optg){
                optg.when_original_html_changed();
            });
        }
    };


    var OptGroup = function(parent_in, $elem_in){
        var self = this;
        self.parent = parent_in;
        self.settings = self.parent.settings;

        self.$elem  = $elem_in;
        self.name   = self.$elem.attr("label");

        self.$options = [];

        self.init();
    };
    OptGroup.prototype = {
        init: function(){
            var self = this;

            // 配下にあるoptionをリストに追加
            self.$elem.find("option").each(function(){
                var obj = new Option(self, $(this));
                self.$options.push(obj);
            })
        },
        get_$html: function(){
            var self = this;

            var $p = $("<p/>");
            for(var i= 0,li=self.$options.length; i< li; i++){
                var $option = self.$options[i];
                $p.append($option.get_$html());
            }

            return $p;
        },
        get_$html_modal: function(){
            var self = this;

            var $p = $("<p/>").append(
                $("<h4/>").text(self.name)
            );
            for(var i= 0,li=self.$options.length; i< li; i++){
                var $option = self.$options[i];
                $p.append($option.get_$html_modal());
            }

            return $p;
        },
        set_selected: function(is_selected){
            var self = this;
            $.each(self.$options, function(index, opt){
                opt.set_selected(is_selected);
            });
        },
        when_original_html_changed: function(){
            var self = this;
            $.each(self.$options, function(index, opt){
                opt.when_original_html_changed();
            });
        }
    };


    var Option = function(parent_in, $elem_in){
        var self = this;
        self.parent = parent_in;
        self.settings = self.parent.settings;

        self.$elem  = $elem_in;
        self.label = self.$elem.text();

        self.is_selected = self.$elem.prop("selected");

        self.$html = "";
        self.$html_modal = "";

        self.init();
    };
    Option.prototype = {
        init: function(){
            var self = this;

            self.build_html();
            self.build_html_modal();
        },
        /**
         * 画面に常時表示されるテーブル用のhtmlを生成
         */
        build_html: function(){
            var self = this,
                $html = $("<span/>").text(self.label);

            if(!self.is_selected){
                $html.hide();
            }

            $html.append(
                $("<span/>").addClass("cancel").html("&times;").click(function(e){
                    self.when_clicked();
                })
            );

            self.$html = $html;
        },
        /**
         * モーダルで表示される用のhtmlを生成
         */
        build_html_modal: function(){
            var self = this,
                $html = $("<span/>").text(self.label);

            if(self.is_selected){
                $html.addClass(self.settings["class_selected"]);
            }

            $html.click(function(e){
                self.when_clicked();
            });

            self.$html_modal = $html;
        },
        get_$html: function(){
            var self = this;
            return self.$html;
        },
        get_$html_modal: function(){
            var self = this;
            return self.$html_modal;
        },
        when_clicked: function(){
            var self = this;
            self.set_selected(!self.is_selected);
        },
        when_original_html_changed: function(){
            var self = this;
            self.is_selected = self.$elem.prop("selected");
            self.toggle_html(self.is_selected);
        },
        /**
         * 選択状態を切り替えるメソッド
          * @param is_selected true/false
         */
        set_selected: function(is_selected){
            var self = this;
            self.is_selected = is_selected;
            self.$elem.prop({"selected": self.is_selected});

            self.toggle_html(self.is_selected);
        },
        toggle_html: function(is_selected){
            var self = this;
            if(!is_selected){
                self.$html.hide();
                self.$html_modal.removeClass(self.settings["class_selected"]);
            }else{
                self.$html.show();
                self.$html_modal.addClass(self.settings["class_selected"]);
            }
        }
    };

})(jQuery);