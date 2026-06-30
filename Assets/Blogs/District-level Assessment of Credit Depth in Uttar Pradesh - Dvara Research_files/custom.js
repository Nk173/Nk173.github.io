jQuery(function ($) {

    $(document).on('click', '.category-select-top', function () {
        $('.category-select-bottom').show();
        $(this).hide();
    });

    $(document).on('click', '.category-select-bottom h5', function () {
        $('.category-select-bottom').hide();
        $('.category-select-top').show();
    });

    $(document).on('click', '.themes-select-top', function () {
        $('.themes-select-bottom').show();
        $(this).hide();
    });

    $(document).on('click', '.themes-select-bottom h5', function () {
        $('.themes-select-bottom').hide();
        $('.themes-select-top').show();
    });

    $(document).on('click', '.save_author', function () {

        let authorid = $(this).data('authorid');
        let userid = $(this).data('userid');
        let pagetype = $(this).data('pagetype');

        saveUnsaveUserAuthors(authorid, userid, pagetype, 'save');
    });

    $(document).on('click', '.delete_author', function () {
        let authorid = $(this).data('authorid');
        let userid = $(this).data('userid');
        let pagetype = $(this).data('pagetype');

        if (confirm('Are you sure you want to unsave it?') == true) {
            saveUnsaveUserAuthors(authorid, userid, pagetype, 'delete');
        }
    });

    $(document).on('click', '.save_post', function () {

        let postid = $(this).data('postid');
        let userid = $(this).data('userid');
        let pagetype = $(this).data('pagetype');

        saveUnsaveUserPosts(postid, userid, pagetype, 'save');
    });

    $(document).on('click', '.delete_post', function () {


        let postid = $(this).data('postid');
        let userid = $(this).data('userid');
        let pagetype = $(this).data('pagetype');

        if (confirm('Are you sure you want to unsave it?') == true) {
            saveUnsaveUserPosts(postid, userid, pagetype, 'delete');
        }

    });

    //Save or Delete user
    function saveUnsaveUserPosts(postId = 0, userId = 0, pageType = 'posts_page', useraction = 'save') {

        //Ajax Url
        var ajaxurl = dvara_core_params.ajaxurl;

        // Ajax Request
        $.ajax({
            url: ajaxurl,
            data: {
                'action': 'saveUnsaveUserPosts',
                'postid': postId,
                'userid': userId,
                'methodtype': useraction
            },
            dataType: 'JSON',
            type: 'POST',
            timeout: 6000,
            beforeSend: function () {
                $('body').addClass('ajax-data-loading');
            },
            success: function (data) {
                if (pageType == 'posts_page') {
                    if (data.content == 'Saved') {
                        $("#save_unsave_postsBtn").removeClass('save_post').addClass('delete_post').text('Unsave Post');
                    } else {
                        $("#save_unsave_postsBtn").removeClass('delete_post').addClass('save_post').text('Save Post');
                    }
                } else {
                    location.reload();
                }

            },
            error: function (jqXHR, textStatus) {
                $('body').removeClass('ajax-data-loading');
                if (textStatus === 'timeout') {
                    console.log('Server Busy. Please Try Again');
                } else {
                    console.log('Some Error Occured. Please Try Again');
                }
            },
        });
    }

    //Save or Delete user
    function saveUnsaveUserAuthors(authorId = 0, userId = 0, pageType = 'authors_page', useraction = 'save') {

        //Ajax Url
        var ajaxurl = dvara_core_params.ajaxurl;

        // Ajax Request
        $.ajax({
            url: ajaxurl,
            data: {
                'action': 'saveUnsaveUserAuthors',
                'authorid': authorId,
                'userid': userId,
                'methodtype': useraction
            },
            dataType: 'JSON',
            type: 'POST',
            timeout: 6000,
            beforeSend: function () {
                $('body').addClass('ajax-data-loading');
            },
            success: function (data) {
                if (pageType == 'authors_page') {
                    if (data.content == 'Saved') {
                        $("#save_unsave_authorsBtn").removeClass('save_author').addClass('delete_author').text('Unsave Author');
                    } else {
                        $("#save_unsave_authorsBtn").removeClass('delete_author').addClass('save_author').text('Save Author');
                    }
                } else {
                    location.reload();
                }
            },
            error: function (jqXHR, textStatus) {
                $('body').removeClass('ajax-data-loading');
                if (textStatus === 'timeout') {
                    console.log('Server Busy. Please Try Again');
                } else {
                    console.log('Some Error Occured. Please Try Again');
                }
            },
        });

    }

    $(document).on('click', '.delete_post_library', function () {

        let postid = $(this).data('postid');
        let userid = $(this).data('userid');
        let pagetype = $(this).data('pagetype');

        if (confirm('Are you sure you want to unsave it?') == true) {
            $(this).parent().remove();
            saveUnsaveUserPosts(postid, userid, pagetype, 'delete');
        }

    });

    $(document).on('click', '.delete_author_library', function () {

        let authorid = $(this).data('authorid');
        let userid = $(this).data('userid');
        let pagetype = $(this).data('pagetype');

        if (confirm('Are you sure you want to unsave it?') == true) {
            $(this).parent().remove();
            saveUnsaveUserAuthors(authorid, userid, pagetype, 'delete');
        }

    });

    $(document).on('click', '#load_more_articles', function () {

        let ppp = Number($("#posts_per_page_article").val()),
            pageNumber = Number($("#currentpage_article").val()),
            total_pages = Number($("#total_pages_article").val());

        pageNumber = pageNumber + 1;
        $("#currentpage_article").val(pageNumber);

        const dataObj = {
            'pageNumber': pageNumber,
            'ppp': ppp,
            'action': 'moreUserSavedArticles'
        };

        $.ajax({
            type: "POST",
            dataType: 'JSON',
            timeout: 6000,
            data: dataObj,
            url: dvara_core_params.ajaxurl,
            beforeSend: () => {
                $("#load_more_articles").text('Loading...').attr('disabled', true);
            },
            success: (data) => {

                $("#user_saved_articles").append(data.content);
                $("#load_more_articles").text('More Articles').attr('disabled', false);

                if (pageNumber >= total_pages) {
                    $("#load_more_articles").hide();
                }

            },
            error: (jqXHR, textStatus, errorThrown) => {
                $("#load_more_articles").text('Articles').attr('disabled', false);
                console.log(jqXHR + " :: " + textStatus + " :: " + errorThrown);
            }

        });
    });

    $(document).on('click', '#load_more_authors', function () {

        let ppp = Number($("#posts_per_page_author").val()),
            pageNumber = Number($("#currentpage_author").val()),
            total_pages = Number($("#total_pages_author").val());

        pageNumber = pageNumber + 1;
        $("#currentpage_author").val(pageNumber);

        const dataObj = {
            'pageNumber': pageNumber,
            'ppp': ppp,
            'action': 'moreUserSavedAuthors'
        };

        $.ajax({
            type: "POST",
            dataType: 'JSON',
            timeout: 6000,
            data: dataObj,
            url: dvara_core_params.ajaxurl,
            beforeSend: () => {
                $("#load_more_authors").text('Loading...').attr('disabled', true);
            },
            success: (data) => {

                $("#user_saved_authors").append(data.content);
                $("#load_more_authors").text('More Authors').attr('disabled', false);

                if (pageNumber >= total_pages) {
                    $("#load_more_authors").hide();
                }

            },
            error: (jqXHR, textStatus, errorThrown) => {
                $("#load_more_authors").text('More Authors').attr('disabled', false);
                console.log(jqXHR + " :: " + textStatus + " :: " + errorThrown);
            }

        });
    });

    $('.postdetailpage').mouseup(function (e) {

        let sectext = getSelectionText();
//         alert(getSelectionText());
//         alert(dvara_core_params.currentpostid);
//         alert(dvara_core_params.userloginornot);

        let currentpostid = dvara_core_params.currentpostid;
        let currentuserid = dvara_core_params.currentuserid;

        if (sectext != '') {
			//console.log('in');
            doConfirm("Are you sure you want to save this text to your reference library?", function yes() {
				//console.log('yes');
                if (dvara_core_params.currentuserid == '0') {
                    $(".notuserlogin").trigger('click');
                } else {
                    saveUserSelectedTexts(sectext, currentuserid, currentpostid);
                }
            }, function no() {
                console.log('user clicked no');
            });

        }
    });

    //Save User Selected text
    function saveUserSelectedTexts(selectedText = '', userId = 0, postId = 0) {

        //Ajax Url
        var ajaxurl = dvara_core_params.ajaxurl;

        // Ajax Request
        $.ajax({
            url: ajaxurl,
            data: {
                'selectedtext': selectedText,
                'currentpostid': postId,
                'currentuserid': userId,
                'action': 'saveUserSelectedTexts'
            },
            dataType: 'JSON',
            type: 'POST',
            timeout: 6000,
            beforeSend: function () {
                $('body').addClass('ajax-data-loading');
            },
            success: function (data) {
                if (data.content == 'Saved') {
                    alert('saved');
                }
            },
            error: function (jqXHR, textStatus) {
                $('body').removeClass('ajax-data-loading');
                if (textStatus === 'timeout') {
                    console.log('Server Busy. Please Try Again');
                } else {
                    console.log('Some Error Occured. Please Try Again');
                }
            },
        });

    }


    $(document).on('click', '.delete_text_library', function () {

        let rowid = $(this).data('rowid');
        let parentdiv = $(this).parent();
        //Ajax Url
        var ajaxurl = dvara_core_params.ajaxurl;

        if (confirm('Are you sure you want to unsave it?') == true) {
            // Ajax Request
            $.ajax({
                url: ajaxurl,
                data: {
                    'rowid': rowid,
                    'action': 'delteUserSelectedTexts'
                },
                dataType: 'JSON',
                type: 'POST',
                timeout: 6000,
                beforeSend: function () {
                    $('body').addClass('ajax-data-loading');
                },
                success: function (data) {
                    if (data.content == 'deleted') {
                        parentdiv.remove();
                        location.reload();
                    }
                },
                error: function (jqXHR, textStatus) {
                    $('body').removeClass('ajax-data-loading');
                    if (textStatus === 'timeout') {
                        console.log('Server Busy. Please Try Again');
                    } else {
                        console.log('Some Error Occured. Please Try Again');
                    }
                },
            });
        }

    });

    $(document).on('click', '#load_more_savedtext', function () {

        let ppp = Number($("#posts_per_page_savedtext").val()),
            pageNumber = Number($("#currentpage_savedtext").val()),
            total_pages = Number($("#total_pages_savedtext").val());

        pageNumber = pageNumber + 1;
        $("#currentpage_savedtext").val(pageNumber);

        const dataObj = {
            'pageNumber': pageNumber,
            'ppp': ppp,
            'action': 'moreUserSavedTexts'
        };

        $.ajax({
            type: "POST",
            dataType: 'JSON',
            timeout: 6000,
            data: dataObj,
            url: dvara_core_params.ajaxurl,
            beforeSend: () => {
                $("#load_more_savedtext").text('Loading...').attr('disabled', true);
            },
            success: (data) => {

                $("#user_saved_texts").append(data.content);
                $("#load_more_savedtext").text('More Texts').attr('disabled', false);

                if (pageNumber >= total_pages) {
                    $("#load_more_savedtext").hide();
                }

            },
            error: (jqXHR, textStatus, errorThrown) => {
                $("#load_more_savedtext").text('More Texts').attr('disabled', false);
                console.log(jqXHR + " :: " + textStatus + " :: " + errorThrown);
            }

        });
    });

    function getSelectionText() {
        var text = "";
        if (window.getSelection) {
            text = window.getSelection().toString();
        } else if (document.selection && document.selection.type != "Control") {
            text = document.selection.createRange().text;
        }
        return text;
    }

    function doConfirm(msg, yesFn, noFn) {
        var confirmBox = $("#main-conf");
        confirmBox.find(".message").text(msg);
        confirmBox.find(".yes,.no").unbind().click(function () {
            confirmBox.hide();
        });
        confirmBox.find(".yes").click(yesFn);
        confirmBox.find(".no").click(noFn);
        confirmBox.show();
    } 
    
    $(document).on('click', '.confirmClose', function () {
        $("#main-conf").hide();
    });

    function getPublicationsbyThemeIds(){

        var themeArr = [];
        $(".themecheck:checked").each(function () {
            themeArr.push($(this).val());
        });

        //console.log(arr);

        const dataObj = {
            'themeid': themeArr,
            'action': 'getPublicationsbyThemeId'
        };

        $.ajax({
            type: "POST",
            dataType: 'JSON',
            timeout: 6000,
            data: dataObj,
            url: dvara_core_params.ajaxurl,
            beforeSend: () => {
                $(".category-select-top").addClass('disabled');
            },
            success: (data) => {
                //console.log(data.content);
                $(".category-select-top").removeClass('disabled');
                $(".inner_list_cat").html(data.content);

                if(parseInt($(".inner_list_cat").outerHeight()) > 300 ){
                    $(".inner_list_cat").css({'height': '300px'});
                } else {
                    $(".inner_list_cat").css({'height': 'auto'});
                }
            },
            error: (jqXHR, textStatus, errorThrown) => {
                $(".category-select-top").removeClass('disabled');
                console.log(jqXHR + " :: " + textStatus + " :: " + errorThrown);
            }

        });
    }
	
	/* $(document).on('change', '#postthemessearch', function () {
        let themeid = $(this).val();

        const dataObj = {
            'themeid': themeid,
            'action': 'getPublicationsbyThemeId'
        };

        $.ajax({
            type: "POST",
            dataType: 'JSON',
            timeout: 6000,
            data: dataObj,
            url: dvara_core_params.ajaxurl,
            beforeSend: () => {
                $(".category-select-top").addClass('disabled');
            },
            success: (data) => {
                //console.log(data.content);
                $(".category-select-top").removeClass('disabled');
                $(".inner_list").html(data.content);
                if(parseInt($(".inner_list").outerHeight()) > 300 ){
                    $(".inner_list").css({'height': '300px'});
                } else {
                    $(".inner_list").css({'height': 'auto'});
                }
            },
            error: (jqXHR, textStatus, errorThrown) => {
                $(".category-select-top").removeClass('disabled');
                console.log(jqXHR + " :: " + textStatus + " :: " + errorThrown);
            }

        });
    }); */

    $(document).on('click', '#postcategoriesall', function(){

        if(this.checked){
            $('.pubcheck').each(function(){
                this.checked = true;
            });
        }else{
             $('.pubcheck').each(function(){
                this.checked = false;
            });
        }
    });
    
    $(document).on('click', '.pubcheck',function(){
        if($('.pubcheck:checked').length == $('.pubcheck').length){
            $('#postcategoriesall').prop('checked',true);
        }else{
            $('#postcategoriesall').prop('checked',false);
        }
    });



    $(document).on('click', '#postthemesall', function(){

        if(this.checked){
            $('.themecheck').each(function(){
                this.checked = true;
            });
        }else{
             $('.themecheck').each(function(){
                this.checked = false;
            });
        }

        getPublicationsbyThemeIds();
    });
    
    $(document).on('click', '.themecheck',function(){
        if($('.themecheck:checked').length == $('.themecheck').length){
            $('#postthemesall').prop('checked',true);
        }else{
            $('#postthemesall').prop('checked',false);
        }

        getPublicationsbyThemeIds();
    });

    //Add height 
    $(".inner_list_cat, .inner_list_theme").css({'height': '300px'});

});