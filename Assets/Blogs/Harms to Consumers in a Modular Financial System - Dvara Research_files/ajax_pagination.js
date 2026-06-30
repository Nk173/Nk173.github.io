jQuery(function ($) {

    $(document).on('click', '.pagination-section ul li a', function (event) {
        event.preventDefault();
        let pageurl = $(this).attr('href');

        if ($('div.ajax_paginaton').length > 0) {
            pageno = getURLParameterforPaged(pageurl, 'paged');
        } else {
            pageno = getURLParameter(pageurl);
        }

        let postauthors = $("#postauthors").val();
        let postthemes = $("#postthemes").val();
        let categoryId = $("#categoryid").val();
        let postcategories = $("#postcategories").val();

        getcategoryFilterPosts(postauthors, postthemes, postcategories, categoryId, pageno);
    });

    $(document).on('change', '#postauthors, #postthemes, #postcategories', function () {

        let postauthors = $("#postauthors").val();
        let postthemes = $("#postthemes").val();
        let categoryId = $("#categoryid").val();
        let postcategories = $("#postcategories").val();

        getcategoryFilterPosts(postauthors, postthemes, postcategories, categoryId, 1);
    });

    function getURLParameterforPaged(url, name) {
        return (RegExp(name + '=' + '(.+?)(&|$)').exec(url) || [, null])[1];
    }

    function getURLParameter(url) {
        let arr = url.split('/');
        return arr[arr.indexOf('page') + 1];
    }

    //Get Posts by Categories
    function getcategoryFilterPosts(postauthors = '', postthemes = '', postcategories = '', categoryId = '', pageno = 1) {

        //Ajax Url
        var ajaxurl = dvara_core_params.ajaxurl;

        // Ajax Request
        $.ajax({
            url: ajaxurl,
            data: {
                'action': 'getcategoryFilterPosts',
                'postauthor': postauthors,
                'posttheme': postthemes,
                'categoryId': categoryId,
                'postcategory': postcategories,
                'pageno': pageno
            },
            dataType: 'JSON',
            type: 'POST',
            timeout: 6000,
            beforeSend: function () {
                $('body').addClass('ajax-data-loading');
            },
            success: function (data) {
                $('body').removeClass('ajax-data-loading');
                $("#category-posts-section").html(data.content);
                $('.pagination-section').remove();
                $('.paging').html(data.pagination);
                
                a2a.init_all();

                $('html, body').animate({
                    scrollTop: $("#category-posts-section").offset().top
                }, 1000);
            },
            error: function (jqXHR, textStatus) {
                $('body').removeClass('ajax-data-loading');
                if (textStatus === 'timeout') {
                    $("#category-posts-section").html('Server Busy. Please Try Again');
                } else {
                    $("#category-posts-section").html('Some Error Occured. Please Try Again');
                }

                $('html, body').animate({
                    scrollTop: $("#category-posts-section").offset().top
                }, 1000);
            },
        });

    }

    //User Work Filter Start
    $(document).on('click', '.wrk-cat', function () {

        let categoryid = $(this).data('catid');
        let authorid = $(this).data('authorid');

        $(this).toggleClass('active').siblings().removeClass('active');

        getUserWorksFilterPosts(categoryid, authorid, 1);
    });

    $(document).on('click', '.pagination-section-works ul li a', function (event) {
        event.preventDefault();
        let pageurl = $(this).attr('href');

        if ($('div.ajax_paginaton').length > 0) {
            pageno = getURLParameterforPaged(pageurl, 'paged');
        } else {
            pageno = getURLParameter(pageurl);
        }

        let categoryid = $('.wrk-cat.active').data('catid');
        let authorid = $('.wrk-cat.active').data('authorid');

        getUserWorksFilterPosts(categoryid, authorid, pageno);
    });

    //Get Articles of Users
    function getUserWorksFilterPosts(categoryId = 0, authorId = 0, pageno = 1) {

        //Ajax Url
        var ajaxurl = dvara_core_params.ajaxurl;

        // Ajax Request
        $.ajax({
            url: ajaxurl,
            data: {
                'action': 'getUserWorksFilterPosts',
                'categoryId': categoryId,
                'authorId': authorId,
                'pageno': pageno
            },
            dataType: 'JSON',
            type: 'POST',
            timeout: 6000,
            beforeSend: function () {
                $('body').addClass('ajax-data-loading');
            },
            success: function (data) {
                $('body').removeClass('ajax-data-loading');
                $("#user_works_section").html(data.content);
                $('.pagination-section-works').remove();
                $('.paging-works').html(data.pagination);
                a2a.init_all();

                $('html, body').animate({
                    scrollTop: $("#user_works_section").offset().top
                }, 1000);
            },
            error: function (jqXHR, textStatus) {
                $('body').removeClass('ajax-data-loading');
                if (textStatus === 'timeout') {
                    $("#user_works_section").html('Server Busy. Please Try Again');
                } else {
                    $("#user_works_section").html('Some Error Occured. Please Try Again');
                }

                $('html, body').animate({
                    scrollTop: $("#user_works_section").offset().top
                }, 1000);
            },
        });

    }

});

