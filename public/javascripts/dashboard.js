let indev = true;
let hydrateURI, followersURI, followingURI = '';

if(indev){
    hydrateURI = '/data/testHyd';
    followersURI = '/data/testFollowers';
    followingURI = '/data/testFollowing';
}else{
    hydrateURI = '/data/hydrateUsers';
    followersURI = '/data/followers';
    followingURI = '/data/following';
}


$(document).ready(function(){
    let preloader = `  <div class="preloader-wrapper active">
    <div class="spinner-layer spinner-red-only">
      <div class="circle-clipper left">
        <div class="circle"></div>
      </div><div class="gap-patch">
        <div class="circle"></div>
      </div><div class="circle-clipper right">
        <div class="circle"></div>
      </div>
    </div>
  </div>`;
    let username = '';
    
    // Modal Handler
    $('.modal').modal();
    
    // Chart Init
    var ctx1 = document.getElementById('chart1');
    var ctx2 = document.getElementById('chart2');
    var data1 = {
        datasets: [{
            data: [],
            backgroundColor: [
                '#119822',
                '#F71735'
            ],
            borderColor: [
                '#119822',
                '#F71735'
            ]
        }],
        labels: [
            'I Follow',
            'I Don\'t Follow'
        ]
    };
    var data2 = {
        datasets: [{
            data: [],
            backgroundColor: [
                '#119822',
                '#F71735'
            ],
            borderColor: [
                '#119822',
                '#F71735'
            ]
        }],
        labels: [
            'Follow Back',
            'Don\'t Follow Back'
        ]
    };

    var options1 = {
        legend: {
            display: true,
            position: 'bottom'
        }
    };
    var options2 = {
        legend: {
            display: true,
            position: 'bottom'
        }
    };

    //AJAX Get Chart Data
    let nFollowers = 0;
    let nFollowing = 0;
    let unfollowers = [];
    let unfollowing = [];
    let chart1Data = [0,0];
    let chart2Data = [0,0];

    let followers = $.get(followersURI, {username:username}, function(data){
        console.log("Follower Data Pulled");
        nFollowers = data.length;
        $("#nFollowers").html(nFollowers);
    }).fail(function(){
        console.log("Follower Data Not Pulled");
        $(".modal").html('<div class="modal-content"><h3>Oops.</h3><p>Seems Like We Cannot Connect To Twitter Right Now</p></div>').modal('open');
    });

    let following = $.get(followingURI, {username:username}, function(data){
        console.log("Following Data Pulled");
        nFollowing = data.length;
        $("#nFollowing").html(nFollowing);
    }).fail(function(){
        console.log("Following Data Not Pulled");
        $(".modal").html('<div class="modal-content"><h3>Oops.</h3><p>Seems Like We Cannot Connect To Twitter Right Now</p></div>').modal('open');
    });

    // ASYNC WAIT
    followers.done(()=>{
        following.done(()=>{
            for(x of followers.responseJSON){
                if(following.responseJSON.includes(x)){
                    chart1Data[0]++;
                }else{
                    chart1Data[1]++;
                    unfollowing.push(x);
                }
            }

            for(x of following.responseJSON){
                if(followers.responseJSON.includes(x))
                   chart2Data[0]++;
                else{
                    chart2Data[1]++;
                    unfollowers.push(x);
                }
            }

            data1.datasets[0].data = chart1Data;
            data2.datasets[0].data = chart2Data;  
            
            var chart1 = new Chart(ctx1, {
                type: 'doughnut',
                data: data1,
                options: options1
            });
            var chart2 = new Chart(ctx2, {
                type: 'doughnut',
                data: data2,
                options: options2
            });

            // DOM EVENT LISTENERS
            $("#getAllUnfollowers").on('click', function(){
                $("#detailsTitle").html("These people are fake to you.")
                $("#preloader").html(preloader);
                $(".collection").html('');
                $.post(hydrateURI, {users: unfollowers.join()}, function(data){
                    
                    $("#preloader").html("");
                    console.log(data);
                    $(".unfollowBtn").off('click');
                    for(x of data){
                        let template= `
                            <li class="collection-item avatar">
                                <img src="${x.profile_image_url}" alt="" class="circle">
                                <span class="title">
                                    <a href="https://twitter.com/${x.screen_name}" target="_blank"><b>${x.name}</b> @${x.screen_name}</a>
                                </span>
                                <p>${x.description}</p>
                                <a href="#!" class="secondary-content">
                                    <button class="btn-small unfollowBtn blue" id="${x.id}">Unfollow</button>
                                </a>
                            </li>`
                        $(".collection").append(template);
                    }
                    $(".unfollowBtn").on('click', function(){
                        let id = this.id;
                        $.post('/t/unfollow', {userId: id}, function(data){
                            console.log(data);
                        });
                    });
                });
            });

            $("#getAllUnfollowing").on('click', function(){
                $("#detailsTitle").html("You are fake to these people.")
                $("#preloader").html(preloader);
                $(".collection").html('');
                $.post(hydrateURI, {users: unfollowing.join()}, function(data){
                    $(".collection").html('');
                    $("#preloader").html("");
                    $(".followBtn").off('click');
                    for(x of data){
                        let template= `
                            <li class="collection-item avatar">
                                <img src="${x.profile_image_url}" alt="" class="circle">
                                <span class="title">
                                    <a href="https://twitter.com/${x.screen_name}" target="_blank"><b>${x.name}</b> @${x.screen_name}</a>
                                </span>
                                <p>${x.description}</p>
                                <a href="#!" class="secondary-content">
                                    <button class="btn-small followBtn blue" id="${x.id}">Follow</button>
                                </a>
                            </li>`
                        $(".collection").append(template);
                    }
                    $(".followBtn").on('click', function(){
                        let id = this.id;
                        $.post('/t/follow', {userId: id}, function(data){
                            console.log(data);
                        });
                    });
                });
            });

        });
    });

    // Connect To Twitter
    $("#connectTwitter").on("click", function(){
        $('.modal').html(`
            <div class="modal-content black-text center-align">
                <h3>Connect to Twitter.</h3>
                <p>By connecting to your Twitter Account, you will be able to easily follow and unfollow persons.</p>
                <a href="/auth/twitterConnect">
                    <button class="btn blue">Connect</button>
                </a>
            </div>
        `).modal('open');
    });

    // User In Twitter
    $("#searchSubmit").on('click', function(){
        username = $("#search").val();
    });


});
